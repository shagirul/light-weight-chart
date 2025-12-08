import { DiffPoint, Point } from '../drawing/data-source';
import { Box, BoxOptions } from './box';
import { InteractionState } from '../drawing/drawing';
import { MouseEventParams } from 'lightweight-charts';

export class StaticBox extends Box {
    constructor(p1: Point, p2: Point, options?: Partial<BoxOptions>) {
        super(p1, p2, {
            lineColor: 'transparent',
            width: 0,
            ...options,
        });
    }

    protected _onMouseDown(): void {
        // Disable interactions for static indicator boxes
    }

    public _onDrag(_diff: DiffPoint): void {
        // Dragging is disabled for static indicator boxes
    }

    public _moveToState(_state: InteractionState): void {
        // Keep the box non-interactive
        this._state = InteractionState.NONE;
    }

    protected _mouseIsOverDrawing(_param: MouseEventParams): boolean {
        return false;
    }
}
