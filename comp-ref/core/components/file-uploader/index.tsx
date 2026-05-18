import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { InputAdornment } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import ImageCrop from '@/components/image-crop';
import Tooltip from '@/components/tool-tip/ToolTip';
import colors from '@/utils/colors';
import { imgPath } from '@/utils/file-utils';
import AppTextfield from '../app-textfield';
import Iconify from '../icon';
import { BoxWrapper, ChipContainer, StyledChip } from './styled-components';
import { FileUploaderProps } from './types';

const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  inputProps,
  onUpload,
  isMultiple = false,
  isCrop = false,
  aspectRatio = 4 / 1,
  isDisabled = false,
  preview = false,
  isViewMode = false,
}) => {
  const { t } = useTranslation();
  const [selectedImg, setSelectedImg] = useState<{ url: string; name: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasFiles = isMultiple
    ? Array.isArray(inputProps?.value) && inputProps?.value.length > 0
    : !!inputProps?.value;
  const chipCount = Array.isArray(inputProps?.value) ? inputProps?.value.length : 1;
  // Base height matches small textfield (37px), add extra for multiple chips
  const dynamicHeight = isMultiple && chipCount > 1 ? 37 + (chipCount - 1) * 32 : 37;

  const handleImageUrlChange = (file: File) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (isCrop) {
        setSelectedImg({ url: imageUrl, name: file?.name });
      }

      if (preview) {
        setPreviewUrl(imageUrl);
        onUpload && onUpload(file);
      }
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const finalFiles = acceptedFiles?.map((file: File) => Object.assign(file));
    if ((isCrop && !isMultiple) || preview) {
      handleImageUrlChange(finalFiles[0]);
    } else {
      if (isMultiple) {
        const newFiles = [...((inputProps?.value as File[]) || []), ...acceptedFiles];
        onUpload(newFiles);
      } else {
        onUpload(acceptedFiles[0]);
      }
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    accept,
    onDrop,
    noClick: true,
    multiple: isMultiple,
  });

  const handleClear = (fileIndex: number) => {
    if (isDisabled) return;
    if (isMultiple) {
      const newFiles = [...(inputProps?.value as File[])];
      newFiles.splice(fileIndex, 1);
      onUpload(newFiles);
    } else {
      setPreviewUrl(null);
      onUpload(null);
    }
  };

  function getLabel(value: string | string[] | File | File[] | null | undefined): string {
    if (typeof value === 'string') {
      return value;
    } else if (Array.isArray(value) && value.length > 0) {
      return value[0] instanceof File ? value[0].name : value[0];
    } else if (value instanceof File) {
      return value.name;
    }
    return 'No file selected';
  }

  const handleTextFieldClick = () => {
    if (isDisabled) return;
    open();
  };

  const onDelete = (file: File | string, fileIndex: number) => {
    if (isViewMode) {
      if (typeof file === 'string') {
        window.open(imgPath(file), '_blank');
      } else {
        window.open(imgPath(file.name), '_blank');
      }
    } else {
      handleClear(fileIndex);
    }
  };

  useEffect(() => {
    if (preview && inputProps?.value && typeof inputProps?.value === 'string') {
      const filePath = imgPath(inputProps?.value);
      setPreviewUrl(filePath || '');
    }
  }, [inputProps, preview]);

  return (
    <BoxWrapper {...getRootProps()}>
      <input id={inputProps?.id} {...getInputProps()} style={{ display: 'none' }} />
      <AppTextfield
        id={inputProps?.id}
        onClick={handleTextFieldClick}
        label={`${t(inputProps?.label as string)}`}
        fullWidth
        placeholder={!hasFiles ? 'Choose' : ''}
        required={inputProps?.markAsRequired}
        error={inputProps?.error}
        helperText={inputProps?.helperText}
        sx={{
          ...inputProps?.sx,
          '& .MuiInputLabel-asterisk': {
            color: colors.dander.rubyRed,
          },
          '& .MuiOutlinedInput-root': {
            minHeight: `${dynamicHeight}px`,
          },
        }}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: hasFiles && (
              <InputAdornment
                position='start'
                sx={{
                  maxWidth: 'calc(100% - 60px)',
                  width: '100%',
                  mr: 1,
                }}
              >
                <ChipContainer>
                  {isMultiple && Array.isArray(inputProps?.value) ? (
                    inputProps?.value.map((file: File | string, index: number) => (
                      <StyledChip
                        key={index}
                        label={typeof file === 'string' ? file : file.name}
                        onDelete={() => onDelete(file, index)}
                        deleteIcon={
                          isViewMode ? <Icon icon='mdi:eye' /> : <Icon icon='carbon:close-filled' />
                        }
                      />
                    ))
                  ) : (
                    <StyledChip
                      disabled={isDisabled}
                      label={getLabel(inputProps?.value)}
                      onDelete={handleClear}
                      deleteIcon={<Icon icon='carbon:close-filled' />}
                    />
                  )}
                </ChipContainer>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end' sx={{ flexShrink: 0 }}>
                <Icon icon='mdi:attachment-plus' fontSize={26} />
              </InputAdornment>
            ),
          },
        }}
      />
      {preview && !isMultiple && previewUrl && (
        <Tooltip title={'Preview'}>
          <Iconify
            fontSize={26}
            icon={'tabler:photo'}
            onClick={() => window.open(previewUrl, '_blank')}
          />
        </Tooltip>
      )}
      {isCrop && selectedImg && (
        <ImageCrop
          open={!!selectedImg}
          image={selectedImg.url}
          fileName={selectedImg.name}
          aspectRatio={aspectRatio}
          onClose={() => setSelectedImg(null)}
          onApply={(file) => {
            onUpload(file);
            setSelectedImg(null);
          }}
        />
      )}
    </BoxWrapper>
  );
};

export default FileUploader;
