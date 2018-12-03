import { Node } from './node';
import { IText, ITextObj } from './types';

export class Text extends Node implements IText {
  public value: string;

  constructor(props: ITextObj) {
    super(props);

    this.value = props.value;
  }
}
