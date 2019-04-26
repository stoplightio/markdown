export interface IFrontmatter<T extends object = any> {
  getAll(): T | void;
  get(prop: keyof T): T[keyof T] | void;
  set(prop: keyof T, value: T[keyof T]): void;
  unset(prop: keyof T): void;
  stringify(): string;
}
