import React from 'react';
import { Grid } from '@mui/material';
import FileUploader from '@/core/components/file-uploader';
import Translations from '@/core/components/translations';
import { FormFileUploadProps } from './types';

export const FormFileUploader: React.FC<FormFileUploadProps> = ({
  inputProps = { label: '', value: '' },
  accept = { 'image/jpeg': ['.jpeg', '.png'] },
  onUpload,
  ...rest
}) => {
  const { label = '', value = '', sx, id, ...field } = inputProps;
  return (
    <Grid>
      <FileUploader
        accept={accept}
        onUpload={onUpload}
        inputProps={{
          id: id,
          variant: 'outlined',
          label: <Translations text={label?.toString() || ''} />,
          value: value,
          sx: { ...sx },
          ...field,
        }}
        {...rest}
      />
    </Grid>
  );
};
