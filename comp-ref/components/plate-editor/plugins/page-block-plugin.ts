import { createPlatePlugin } from '@udecode/plate/react';
import { Element, Node, type NodeEntry, Path, Transforms } from 'slate';
import { PAGE_BLOCK } from '../types';

export const PageBlockPlugin = createPlatePlugin({
  key: PAGE_BLOCK,
  node: {
    isElement: true,
    type: PAGE_BLOCK,
  },
  extendEditor: ({ editor }) => {
    const { normalizeNode } = editor as any;

    editor.normalizeNode = (entry: NodeEntry) => {
      const [node, path] = entry;

      // If this is a page-block nested inside another page-block, unwrap it
      if (Element.isElement(node) && (node as any).type === PAGE_BLOCK && path.length > 1) {
        // Lift all children of the nested page-block into the parent
        const children = [...(node as any).children];
        Transforms.removeNodes(editor as any, { at: path });
        for (let i = children.length - 1; i >= 0; i--) {
          Transforms.insertNodes(editor as any, children[i], { at: path });
        }
        return;
      }

      // Ensure root-level nodes are always page-blocks
      if (path.length === 1 && Element.isElement(node) && (node as any).type !== PAGE_BLOCK) {
        Transforms.wrapNodes(
          editor as any,
          {
            type: PAGE_BLOCK,
            hasLetterhead: false,
            hasLetterFooter: false,
            direction: 'ltr',
            children: [],
          } as any,
          { at: path },
        );
        return;
      }

      normalizeNode(entry);
    };

    return editor;
  },
});
