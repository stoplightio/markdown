import { parse } from '../../parse';
import unified from 'unified';
import stripJsProtocol from '../stripJsProtocol';

describe('stripJsProtocol plugin', () => {
  it('should strip links containing javascript: protocol', () => {
    const parsed = parse(`[xss](javascript:alert(location))
[call calc](javascript:window.require('child_process').execFile('/System/Applications/Calculator.app/Contents/MacOS/Calculator',function(){}))
[do call calc](window.require('child_process').execFile('/System/Applications/Calculator.app/Contents/MacOS/Calculator',function(){}))
`);

    expect(
      unified()
        .use(stripJsProtocol)
        .runSync(parsed),
    ).toStrictEqual({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          position: expect.any(Object),
          children: [
            {
              type: 'link',
              url: '#',
              title: null,
              children: expect.any(Array),
              position: expect.any(Object),
            },
            {
              type: 'text',
              value: '\n',
              position: expect.any(Object),
            },
            {
              type: 'link',
              url: '#',
              title: null,
              children: expect.any(Array),
              position: expect.any(Object),
            },
            {
              type: 'text',
              value: '\n',
              position: expect.any(Object),
            },  {
              type: 'link',
              url: 'window.require(\'child_process\').execFile(\'/System/Applications/Calculator.app/Contents/MacOS/Calculator\',function(){})',
              title: null,
              children: expect.any(Array),
              position: expect.any(Object),
            },
          ],
        },
      ],
      position: expect.any(Object),
    });
  });
});
