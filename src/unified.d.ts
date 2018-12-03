declare module 'unified' {
  import VFile from 'vfile';

  export interface INodeObj {
    type: string;
    data?: IDataObj;
    position?: IPositionObj;

    [index: string]: any;
  }

  export interface Node extends INodeObj {
  }

  export interface IDataObj {
    [key: string]: any;
  }

  export interface Data extends IDataObj {
  }

  export interface IPositionObj {
    start: IPointObj;
    end: IPointObj;
    indent?: number;
  }

  export interface Position extends IPositionObj {
  }

  export interface IPointObj {
    line: number;
    column: number;
    offset?: number;
  }

  export interface Point extends IPointObj {
  }

  export interface IParentObj extends INodeObj {
    children: INodeObj[];
  }

  export interface Parent extends IParentObj {
  }

  export interface ITextObj extends INodeObj {
    value: string;
  }

  export interface Text extends ITextObj {
  }

  export declare function attacher(options?: any): transformer | void;

  export declare function transformer(node: Node, file: VFile, next?: (err?: Error, node?: Node, file?: VFile) => void): Error | Node | Promise<Node | void>;

  export interface Plugin {
    (): transformer
  }

  export interface Preset {
    settings?: any;
    plugins: Plugin[];
  }

  export interface Compiler {
    (tree: Node): string
    new(): Partial<{ compile: (tree: Node) => string; }>;
  }

  export interface Parser {
    (input: string): Node;
    new(): Partial<{ parse: (input: string) => Node; }>;
  }

  export interface Processor {
    (): Processor;

    use(plugin: Plugin, options?: any): Processor;
    use(preset: Preset): Processor;
    use(list: Array<Plugin | [Plugin, any]>): Processor;
    parse(input: VFile | string): Node,
    stringify(node: Node, file?: VFile): string,
    run(node: Node, file: VFile): Promise<Node>;
    run(node: Node, file: VFile, done: (err: Error, node: Node, file: VFile) => void): void
    runSync(node: Node, file?: VFile): Node,
    process(node: Node, value: string): Promise<Node>;
    process(node: Node, value: string, done: (err: Error | undefined, file: VFile) => void): void
    processSync(input: Node | string): VFile,
    data(key: string): any;
    data(key: string, value: any): Processor;
    freeze(): Processor;

    Parser: Parser;
    Compiler: Compiler;
  }

  const processor: {
    (): Unified.Processor
  };

  export default processor
}
