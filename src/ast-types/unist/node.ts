import { IData, INode, INodeObj, IPosition } from './types';

export class Node implements INode {
  public type: string = '';
  public data?: IData;
  public position?: IPosition;

  constructor(props: INodeObj) {
    this.type = props.type;
    this.data = props.data;
    this.position = props.position;
  }
}
