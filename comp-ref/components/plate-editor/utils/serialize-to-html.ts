import { ATTACHMENT, PAGE_BLOCK, PLACEHOLDER } from '../types';

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const serializeLeaf = (node: any): string => {
  let text = escapeHtml(node.text || '');
  if (!text && !node.text) return '';

  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;

  return text;
};

const serializeNode = (node: any, sampleData?: Record<string, string>): string => {
  if (node.text !== undefined) {
    return serializeLeaf(node);
  }

  const children = (node.children || [])
    .map((child: any) => serializeNode(child, sampleData))
    .join('');

  switch (node.type) {
    case PAGE_BLOCK: {
      const dir = node.direction || 'ltr';
      const letterheadHtml =
        node.hasLetterhead && node.letterheadUrl
          ? `<div style="width:100%;text-align:center;border-bottom:1px solid #ddd;"><img src="${node.letterheadUrl}" style="width:100%;display:block;" /></div>`
          : '';
      const letterFooterHtml =
        node.hasLetterFooter && node.letterFooterUrl
          ? `<div style="width:100%;text-align:center;border-top:1px solid #ddd;"><img src="${node.letterFooterUrl}" style="width:100%;display:block;" /></div>`
          : '';
      return `<div class="page-block" style="direction:${dir};page-break-after:always;width:210mm;min-height:297mm;padding:20mm 24mm;box-sizing:border-box;background:white;display:flex;flex-direction:column;">${letterheadHtml}<div style="flex:1;">${children}</div>${letterFooterHtml}</div>`;
    }
    case PLACEHOLDER: {
      const value = sampleData?.[node.field] || `{{${node.label || node.field}}}`;
      return `<span class="placeholder" data-field="${node.field}">${escapeHtml(value)}</span>`;
    }
    case ATTACHMENT: {
      const align = node.alignment || 'left';
      const alignStyle =
        align === 'center'
          ? 'text-align:center;'
          : align === 'right'
            ? 'text-align:right;'
            : 'text-align:left;';
      return `<div style="${alignStyle}margin:10px 0;"><img src="${node.url}" style="width:${node.width || 'auto'};max-width:100%;" /></div>`;
    }
    case 'h1':
      return `<h1>${children}</h1>`;
    case 'h2':
      return `<h2>${children}</h2>`;
    case 'h3':
      return `<h3>${children}</h3>`;
    case 'ul':
      return `<ul>${children}</ul>`;
    case 'ol':
      return `<ol>${children}</ol>`;
    case 'li':
      return `<li>${children}</li>`;
    case 'table':
      return `<table style="border-collapse:collapse;width:100%;">${children}</table>`;
    case 'tr':
      return `<tr>${children}</tr>`;
    case 'td':
      return `<td style="border:1px solid #ddd;padding:8px;">${children}</td>`;
    case 'th':
      return `<th style="border:1px solid #ddd;padding:8px;font-weight:bold;">${children}</th>`;
    case 'p':
    default:
      return `<p>${children || '&nbsp;'}</p>`;
  }
};

export const serializeToHtml = (nodes: any[], sampleData?: Record<string, string>): string => {
  return nodes.map((node) => serializeNode(node, sampleData)).join('');
};

export const serializeToPreviewHtml = (
  nodes: any[],
  sampleData?: Record<string, string>,
): string => {
  const body = serializeToHtml(nodes, sampleData);
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; }
  .page-block { background: white; }
  .page-block + .page-block { page-break-before: always; }
  p { margin: 0 0 8px 0; }
  h1 { font-size: 24px; margin: 0 0 12px 0; }
  h2 { font-size: 20px; margin: 0 0 10px 0; }
  h3 { font-size: 16px; margin: 0 0 8px 0; }
  ul, ol { margin: 0 0 8px 20px; }
  .placeholder { background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 3px; font-weight: 500; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; }
  td, th { border: 1px solid #ddd; padding: 8px; }
</style>
</head>
<body>${body}</body>
</html>`;
};
