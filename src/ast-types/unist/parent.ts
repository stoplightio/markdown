import { Node } from './node';
import { INode, IParent, IParentObj } from './types';

export class Parent extends Node implements IParent {
  public children: INode[];

  constructor(props: IParentObj) {
    super(props);

    this.children = props.children;
  }
}
