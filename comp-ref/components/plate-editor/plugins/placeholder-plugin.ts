import { createPlatePlugin } from '@udecode/plate/react';
import { PLACEHOLDER } from '../types';

export const PlaceholderPlugin = createPlatePlugin({
  key: PLACEHOLDER,
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
    type: PLACEHOLDER,
  },
});
