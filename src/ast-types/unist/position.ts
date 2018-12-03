import { IPoint, IPosition, IPositionObj } from './types';

export class Position implements IPosition {
  public start: IPoint;
  public end: IPoint;
  public indent?: number;

  constructor(props: IPositionObj) {
    this.start = props.start;
    this.end = props.end;
    this.indent = props.indent;
  }
}
