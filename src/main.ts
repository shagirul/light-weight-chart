import './style.css';
import {
  CandlestickData,
  ColorType,
  LineStyle,
  Time,
  createChart,
} from 'lightweight-charts';

interface PricePoint {
  time: Time;
  price: number;
}

interface LineShape {
  id: string;
  from: PricePoint;
  to: PricePoint;
  color: string;
}

interface RectangleShape {
  id: string;
  from: PricePoint;
  to: PricePoint;
  fill: string;
  stroke: string;
}

const sampleCandles: CandlestickData[] = [
  { time: '2024-05-20', open: 108, high: 112, low: 104, close: 110 },
  { time: '2024-05-21', open: 110, high: 113, low: 108, close: 109 },
  { time: '2024-05-22', open: 109, high: 116, low: 107, close: 115 },
  { time: '2024-05-23', open: 115, high: 118, low: 112, close: 114 },
  { time: '2024-05-24', open: 114, high: 119, low: 112, close: 118 },
  { time: '2024-05-27', open: 118, high: 121, low: 115, close: 116 },
  { time: '2024-05-28', open: 116, high: 117, low: 110, close: 112 },
  { time: '2024-05-29', open: 112, high: 114, low: 108, close: 111 },
  { time: '2024-05-30', open: 111, high: 113, low: 109, close: 112 },
  { time: '2024-05-31', open: 112, high: 117, low: 111, close: 116 },
  { time: '2024-06-03', open: 116, high: 120, low: 114, close: 118 },
  { time: '2024-06-04', open: 118, high: 119, low: 113, close: 114 },
  { time: '2024-06-05', open: 114, high: 116, low: 110, close: 112 },
  { time: '2024-06-06', open: 112, high: 117, low: 111, close: 116 },
  { time: '2024-06-07', open: 116, high: 121, low: 115, close: 120 },
  { time: '2024-06-10', open: 120, high: 124, low: 119, close: 123 },
  { time: '2024-06-11', open: 123, high: 125, low: 118, close: 119 },
  { time: '2024-06-12', open: 119, high: 121, low: 116, close: 118 },
  { time: '2024-06-13', open: 118, high: 123, low: 117, close: 121 },
  { time: '2024-06-14', open: 121, high: 126, low: 120, close: 125 },
];

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App container missing');
}

app.innerHTML = `
  <div class="app-shell">
    <header>
      <h1>Lightweight Chart + custom annotations</h1>
      <p>Create predefined lines and rectangles, render them over the chart, and manage them from state.</p>
    </header>
    <div class="chart-area" id="chart-area"></div>
    <div class="controls">
      <div class="card">
        <h3>Add a line</h3>
        <p class="muted">Pick two points and a stroke color. Times should match the sample candle dates.</p>
        <div class="buttons">
          <input id="line-start-time" type="date" />
          <input id="line-start-price" type="number" step="0.1" placeholder="Start price" />
          <input id="line-end-time" type="date" />
          <input id="line-end-price" type="number" step="0.1" placeholder="End price" />
          <input id="line-color" type="color" value="#22d3ee" />
          <button id="add-line">Add line</button>
        </div>
      </div>
      <div class="card">
        <h3>Draw a rectangle</h3>
        <p class="muted">Define opposite corners and a fill color.</p>
        <div class="buttons">
          <input id="rect-start-time" type="date" />
          <input id="rect-start-price" type="number" step="0.1" placeholder="Low price" />
          <input id="rect-end-time" type="date" />
          <input id="rect-end-price" type="number" step="0.1" placeholder="High price" />
          <input id="rect-fill" type="color" value="#22c55e" />
          <button id="add-rect">Add rectangle</button>
        </div>
      </div>
      <div class="card">
        <h3>Current drawings</h3>
        <div id="state-list" class="state-list"></div>
      </div>
    </div>
  </div>
`;

const chartHost = document.querySelector<HTMLDivElement>('#chart-area');
if (!chartHost) {
  throw new Error('Chart host missing');
}

const chart = createChart(chartHost, {
  width: chartHost.clientWidth,
  height: 460,
  layout: {
    textColor: '#e5e7eb',
    background: { type: ColorType.Solid, color: '#0b1220' },
  },
  grid: {
    vertLines: { color: '#1f2937' },
    horzLines: { color: '#1f2937' },
  },
  rightPriceScale: { borderColor: '#1f2937' },
  timeScale: { borderColor: '#1f2937' },
  crosshair: { horzLine: { style: LineStyle.Solid }, vertLine: { style: LineStyle.Solid } },
});

const candleSeries = chart.addCandlestickSeries({
  upColor: '#22c55e',
  downColor: '#ef4444',
  borderVisible: false,
  wickUpColor: '#22c55e',
  wickDownColor: '#ef4444',
});

candleSeries.setData(sampleCandles);

const overlay = document.createElement('canvas');
overlay.className = 'chart-overlay';
chartHost.appendChild(overlay);
const ctx = overlay.getContext('2d');
if (!ctx) {
  throw new Error('Unable to acquire overlay context');
}

const lines: LineShape[] = [];
const rectangles: RectangleShape[] = [];
let idCounter = 1;

const lineInputs = {
  startTime: document.querySelector<HTMLInputElement>('#line-start-time'),
  startPrice: document.querySelector<HTMLInputElement>('#line-start-price'),
  endTime: document.querySelector<HTMLInputElement>('#line-end-time'),
  endPrice: document.querySelector<HTMLInputElement>('#line-end-price'),
  color: document.querySelector<HTMLInputElement>('#line-color'),
};

const rectInputs = {
  startTime: document.querySelector<HTMLInputElement>('#rect-start-time'),
  startPrice: document.querySelector<HTMLInputElement>('#rect-start-price'),
  endTime: document.querySelector<HTMLInputElement>('#rect-end-time'),
  endPrice: document.querySelector<HTMLInputElement>('#rect-end-price'),
  fill: document.querySelector<HTMLInputElement>('#rect-fill'),
};

const stateList = document.querySelector<HTMLDivElement>('#state-list');

const defaultLine = {
  startTime: sampleCandles[2].time as string,
  startPrice: sampleCandles[2].low,
  endTime: sampleCandles[14].time as string,
  endPrice: sampleCandles[14].high,
};

const defaultRect = {
  startTime: sampleCandles[6].time as string,
  startPrice: sampleCandles[6].low,
  endTime: sampleCandles[11].time as string,
  endPrice: sampleCandles[11].high,
};

function seedInputs() {
  if (lineInputs.startTime) lineInputs.startTime.value = defaultLine.startTime;
  if (lineInputs.startPrice) lineInputs.startPrice.value = defaultLine.startPrice.toString();
  if (lineInputs.endTime) lineInputs.endTime.value = defaultLine.endTime;
  if (lineInputs.endPrice) lineInputs.endPrice.value = defaultLine.endPrice.toString();

  if (rectInputs.startTime) rectInputs.startTime.value = defaultRect.startTime;
  if (rectInputs.startPrice) rectInputs.startPrice.value = defaultRect.startPrice.toString();
  if (rectInputs.endTime) rectInputs.endTime.value = defaultRect.endTime;
  if (rectInputs.endPrice) rectInputs.endPrice.value = defaultRect.endPrice.toString();
}

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function toCoordinate(point: PricePoint) {
  const x = chart.timeScale().timeToCoordinate(point.time);
  const y = candleSeries.priceToCoordinate(point.price);
  if (x === null || y === null) return null;
  return { x, y };
}

function syncOverlaySize() {
  const { width, height } = chartHost.getBoundingClientRect();
  overlay.width = Math.floor(width);
  overlay.height = Math.floor(height);
}

function drawLine(shape: LineShape) {
  const from = toCoordinate(shape.from);
  const to = toCoordinate(shape.to);
  if (!from || !to) return;
  ctx.save();
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawRectangle(shape: RectangleShape) {
  const start = toCoordinate(shape.from);
  const end = toCoordinate(shape.to);
  if (!start || !end) return;

  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  ctx.save();
  ctx.fillStyle = shape.fill;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(x, y, width, height);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = shape.stroke;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

function renderOverlay() {
  syncOverlaySize();
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  rectangles.forEach(drawRectangle);
  lines.forEach(drawLine);
}

function renderState() {
  if (!stateList) return;
  stateList.innerHTML = '';
  const all = [
    ...lines.map((line) => ({ id: line.id, label: 'Line', details: `${line.from.time} → ${line.to.time}` })),
    ...rectangles.map((rect) => ({ id: rect.id, label: 'Rectangle', details: `${rect.from.time} → ${rect.to.time}` })),
  ];

  if (!all.length) {
    stateList.innerHTML = '<div class="empty">No drawings yet. Add a line or rectangle.</div>';
    return;
  }

  all.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'state-row';
    row.innerHTML = `<div><strong>${entry.label}</strong><br/><small>${entry.details}</small></div>`;
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.onclick = () => deleteShape(entry.id);
    row.appendChild(btn);
    stateList.appendChild(row);
  });
}

function deleteShape(id: string) {
  const lineIndex = lines.findIndex((l) => l.id === id);
  if (lineIndex >= 0) {
    lines.splice(lineIndex, 1);
    renderOverlay();
    renderState();
    return;
  }

  const rectIndex = rectangles.findIndex((r) => r.id === id);
  if (rectIndex >= 0) {
    rectangles.splice(rectIndex, 1);
    renderOverlay();
    renderState();
  }
}

function addLineFromInputs() {
  if (!lineInputs.startTime || !lineInputs.startPrice || !lineInputs.endTime || !lineInputs.endPrice || !lineInputs.color) {
    return;
  }

  const shape: LineShape = {
    id: nextId('line'),
    from: { time: lineInputs.startTime.value as Time, price: parseFloat(lineInputs.startPrice.value) },
    to: { time: lineInputs.endTime.value as Time, price: parseFloat(lineInputs.endPrice.value) },
    color: lineInputs.color.value,
  };

  lines.push(shape);
  renderOverlay();
  renderState();
}

function addRectangleFromInputs() {
  if (!rectInputs.startTime || !rectInputs.startPrice || !rectInputs.endTime || !rectInputs.endPrice || !rectInputs.fill) {
    return;
  }

  const fillColor = rectInputs.fill.value;
  const shape: RectangleShape = {
    id: nextId('rect'),
    from: { time: rectInputs.startTime.value as Time, price: parseFloat(rectInputs.startPrice.value) },
    to: { time: rectInputs.endTime.value as Time, price: parseFloat(rectInputs.endPrice.value) },
    fill: fillColor,
    stroke: fillColor,
  };

  rectangles.push(shape);
  renderOverlay();
  renderState();
}

function wireControls() {
  seedInputs();
  document.querySelector<HTMLButtonElement>('#add-line')?.addEventListener('click', addLineFromInputs);
  document.querySelector<HTMLButtonElement>('#add-rect')?.addEventListener('click', addRectangleFromInputs);
}

wireControls();
renderState();
renderOverlay();

window.addEventListener('resize', () => {
  chart.resize(chartHost.clientWidth, chartHost.clientHeight);
  renderOverlay();
});

chart.timeScale().fitContent();
chart.timeScale().subscribeVisibleTimeRangeChange(renderOverlay);
chart.subscribeCrosshairMove(renderOverlay);
