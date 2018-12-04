declare module 'unified' {
  import VFile from 'vfile';
  import { INode as Node } from './ast-types/unist';

  export declare function attacher(options?: any): transformer | void;

  export declare function transformer(
    node: Node,
    file: VFile,
    next?: (err?: Error, node?: Node, file?: VFile) => void
  ): Error | Node | Promise<Node | void>;

  export type IPlugin = () => transformer;

  export interface IPreset {
    settings?: any;
    plugins: IPlugin[];
  }

  export interface ICompiler {
    (tree: Node): string;
    new (): Partial<{ compile: (tree: Node) => string }>;
  }

  export interface IParser {
    (input: string): Node;
    new (): Partial<{ parse: (input: string) => Node }>;
  }

  export interface IProcessor {
    (): IProcessor;

    use(plugin: IPlugin, options?: any): IProcessor;
    use(input: IPreset | Array<IPlugin | [IPlugin, any]>): IProcessor;
    parse(input: VFile | string): Node;
    stringify(node: Node, file?: VFile): string;
    run(node: Node, file: VFile): Promise<Node>;
    run(node: Node, file: VFile, done: (err: Error, node: Node, file: VFile) => void): void;
    runSync(node: Node, file?: VFile): Node;
    process(node: Node, value: string): Promise<Node>;
    process(node: Node, value: string, done: (err: Error | undefined, file: VFile) => void): void;
    processSync(input: Node | string): VFile;
    data(key: string): any;
    data(key: string, value: any): IProcessor;
    freeze(): IProcessor;

    Parser: IParser;
    Compiler: ICompiler;
  }

  const processor: () => Unified.IProcessor;

  export default processor;
}
