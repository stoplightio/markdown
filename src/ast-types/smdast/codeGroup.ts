import { ICode, Parent } from '../mdast';

export interface ICodeGroup extends Parent {
  type: 'codegroup';
  children: ICode[];
}
