export interface INodeObj {
  type: string;
  data?: IDataObj;
  position?: IPositionObj;

  [index: string]: any;
}
export interface INode extends INodeObj {}

export interface IDataObj {
  [key: string]: any;
}
export interface IData extends IDataObj {}

export interface IPositionObj {
  start: IPointObj;
  end: IPointObj;
  indent?: number;
}
export interface IPosition extends IPositionObj {}

export interface IPointObj {
  line: number;
  column: number;
  offset?: number;
}
export interface IPoint extends IPointObj {}

export interface IParentObj extends INodeObj {
  children: INodeObj[];
}
export interface IParent extends IParentObj {}

export interface ITextObj extends INodeObj {
  value: string;
}
export interface IText extends ITextObj {}

// JSON path within the Unist tree
export type JSONPath = string;
