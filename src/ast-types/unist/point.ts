import { IPoint, IPointObj } from './types';

export class Point implements IPoint {
  public line: number;
  public column: number;
  public offset?: number;

  constructor(props: IPointObj) {
    this.line = props.line;
    this.column = props.column;
    this.offset = props.offset;
  }
}
