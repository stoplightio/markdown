import { MDAST } from '../ast-types';
import { Frontmatter } from '../frontmatter';
import { getProperty } from './get-property';

// Priority: yaml title, then first heading
export const getTitle = (data?: MDAST.Root | string) => {
  if (typeof data === 'string') {
    return getTitleFromRaw(data);
  } else {
    return getProperty('title', 'heading', data);
  }
};

function getTitleFromRaw(raw?: string) {
  if (!raw) return raw;

  const frontmatterBlock = Frontmatter.getFrontmatterBlock(raw);

  if (frontmatterBlock) {
    const title = new Frontmatter(frontmatterBlock).get('title');
    if (title) {
      return String(title);
    }
  }

  // Note: This only supports #-style headings, but underlined headings are much rarer
  // Sonar Cloud flagged the original version /^#+\s*(.*)$/m as super-linear, so it has
  // become this rather nasty regex to emulate atomic groups / possessive qualifiers.
  const match = raw?.match(/^(?=(#+))\1(?=(\s*))\2(?=(.*))\3$/m);
  return match ? match[3] : void 0;
}
