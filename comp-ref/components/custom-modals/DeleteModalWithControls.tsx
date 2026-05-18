'use client';

import Image from 'next/image';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Controller } from 'react-hook-form';
import { EXCLAMATION } from '@/configs/image-paths';
import withModal from '@/core/components/app-modal/WithModal';
import AppTextfield from '@/core/components/app-textfield';
import AppButton from '@/core/components/button';
import Translations from '@/core/components/translations';
import { Container } from './styled-components';
import { DeleteModalProps } from './types';

const renderTypography = (
  text: string | React.ReactNode,
  variant: 'title' | 'delete-confirmation',
) => {
  return (
    <Typography className={variant}>
      {typeof text === 'string' ? <Translations text={text} /> : text}
    </Typography>
  );
};

const DeleteModalWithControls: React.FC<DeleteModalProps> = ({
  containerWidth,
  containerProps,
  iconSize = 70,
  title = 'Are you sure?',
  confirmationText = 'You want to delete this record?',
  additionalConfirmationText,
  containedLabel = 'Delete',
  outlineLabel = 'Cancel',
  containedButtonProps,
  outlinedButtonProps,
  endContent,
  onClose,
  onDelete,
  isShowCommentBox = false,
  control,
}) => {
  return (
    <Container containerWidth={containerWidth} {...containerProps}>
      <Image
        src={EXCLAMATION}
        alt='exclamation_icon'
        className='exclamation'
        width={iconSize}
        height={iconSize}
      />
      <Box className='confirmation-container'>
        {renderTypography(title, 'title')}
        {renderTypography(confirmationText, 'delete-confirmation')}
        {renderTypography(additionalConfirmationText, 'delete-confirmation')}
        {endContent}
      </Box>
      {isShowCommentBox && (
        <Box width={345} mt={2}>
          <Controller
            name='comment'
            control={control}
            render={({ field: { value, onChange } }) => (
              <AppTextfield onChange={onChange} value={value} multiline rows={3} label='Comments' />
            )}
          />
        </Box>
      )}
      <Box className='button-wrapper'>
        <AppButton type='submit' onClick={onDelete} {...containedButtonProps}>
          <Translations text={containedLabel} />
        </AppButton>
        <AppButton variant='outlined' onClick={onClose} {...outlinedButtonProps}>
          <Translations text={outlineLabel} />
        </AppButton>
      </Box>
    </Container>
  );
};

export default withModal(DeleteModalWithControls);
