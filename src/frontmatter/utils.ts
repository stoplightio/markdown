import * as Unist from 'unist';

export function countNewLines(value: string) {
  const matches = value.match(/\n/g);
  return matches === null ? 0 : matches.length;
}

export function shiftLines(node: Unist.Node | Unist.Parent, diff: number) {
  if (node.position !== undefined) {
    if (node.type !== 'root' && node.type !== 'yaml') {
      node.position.start.line += diff;
    }

    node.position.end.line += diff;
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      shiftLines(child, diff);
    }
  }
}
