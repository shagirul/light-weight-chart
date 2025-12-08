# Rectangle example (examples/7_rectangles)

Follow these steps to create an isolated Python environment, install the library locally, and launch the rectangle demo.

## 1) Create and activate a virtual environment
From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
python -m pip install --upgrade pip
```

## 2) Install the package and dependencies locally
Still at the repository root, install the project in editable mode so the example imports work:

```bash
pip install -e .
```

This installs `lightweight_charts`, `pandas`, and `pywebview` for the example.

## 3) Run the rectangle example
You can run the script directly from the root (the script resolves its own CSV path):

```bash
python examples/7_rectangles/rectangles.py
```

Or change into the example directory first:

```bash
cd examples/7_rectangles
python rectangles.py
```

## 4) What to expect
- A window opens showing the candlestick data with a blue, 20% opacity rectangle over the first three candles (no border, not draggable/editable).
- A topbar button labeled **“Show Rectangle”** re-renders the same static box on click.
- Close the window to end the process.
