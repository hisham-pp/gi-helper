import Image from 'next/image';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { EXCLAMATION } from '@/configs/image-paths';
import withModal from '@/core/components/app-modal/WithModal';
import AppButton from '@/core/components/button';
import Translations from '@/core/components/translations';
import { Container } from './styled-components';

type ConfirmationModalProps = {
  open?: boolean;
  containerWidth?: number;
  iconSize?: number;
  title?: string | React.ReactNode;
  confirmationText?: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose?: () => void;
  onConfirm?: () => void;
};

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

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  containerWidth,
  iconSize = 70,
  title = 'Are you sure?',
  confirmationText = 'Do you want to proceed with this action?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onClose,
  onConfirm,
}) => {
  return (
    <Container containerWidth={containerWidth}>
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
      </Box>
      <Box className='button-wrapper'>
        <AppButton type='submit' onClick={onConfirm}>
          <Translations text={confirmLabel} />
        </AppButton>
        <AppButton variant='outlined' onClick={onClose}>
          <Translations text={cancelLabel} />
        </AppButton>
      </Box>
    </Container>
  );
};

export default withModal(ConfirmationModal);
