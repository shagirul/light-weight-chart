from pathlib import Path
import sys

import pandas as pd

# Ensure the repository root is importable when running the example directly
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from lightweight_charts import Chart


def draw_reference_box(chart: Chart, candle_data: pd.DataFrame):
    first_three = candle_data.head(3)
    start_time = first_three.iloc[0]['date']
    end_time = first_three.iloc[-1]['date']
    high_level = first_three['high'].max()
    low_level = first_three['low'].min()

    # Transparent outline removes the border while keeping the body filled.
    chart.box(
        start_time=start_time,
        start_value=high_level,
        end_time=end_time,
        end_value=low_level,
        color='transparent',
        fill_color='rgba(0, 122, 255, 0.2)',
        width=0,
    )
    # The box is added directly to the series so it stays static and non-editable.

if __name__ == '__main__':
    df = pd.read_csv('ohlcv.csv')

    chart = Chart()
    chart.set(df)

    draw_reference_box(chart, df)

    chart.topbar.button(
        'draw_box',
        'Show Rectangle',
        func=lambda c: draw_reference_box(c, df),
    )

    chart.show(block=True)
