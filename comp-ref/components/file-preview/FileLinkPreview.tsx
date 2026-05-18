import React from 'react';
import AppLink from '@/core/components/link';
import { extractFileMetadataFromUrl, imgPath } from '@/utils/file-utils';
import { FileLinkPreviewProps } from './types';

const FileLinkPreview: React.FC<FileLinkPreviewProps> = ({ path }) => {
  if (!path || typeof path !== 'string') return null;

  const { fileName } = extractFileMetadataFromUrl(path);

  return (
    <AppLink to={imgPath(path)} target='_blank' sx={{ textDecoration: 'underline !important' }}>
      {fileName}
    </AppLink>
  );
};

export default FileLinkPreview;
