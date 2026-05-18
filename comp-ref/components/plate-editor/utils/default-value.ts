import { PAGE_BLOCK } from '../types';

export const createDefaultValue = (): any[] => [
  {
    type: PAGE_BLOCK,
    hasLetterhead: true,
    hasLetterFooter: true,
    direction: 'ltr' as const,
    children: [{ type: 'p', children: [{ text: '' }] }],
  },
];

export const wrapHtmlInPageBlock = (htmlContent: string): any[] => {
  return [
    {
      type: PAGE_BLOCK,
      hasLetterhead: false,
      hasLetterFooter: false,
      direction: 'ltr' as const,
      children: [{ type: 'p', children: [{ text: htmlContent || '' }] }],
    },
  ];
};
