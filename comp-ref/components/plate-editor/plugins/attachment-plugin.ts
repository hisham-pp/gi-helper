import { createPlatePlugin } from '@udecode/plate/react';
import { ATTACHMENT } from '../types';

export const AttachmentPlugin = createPlatePlugin({
  key: ATTACHMENT,
  node: {
    isElement: true,
    isVoid: true,
    type: ATTACHMENT,
  },
});
