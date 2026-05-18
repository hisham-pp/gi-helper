import { ElementType } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import withModal from '@/core/components/app-modal/WithModal';
import Translations from '@/core/components/translations';
import { Container } from './Components';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.JSX.Element;
  title?: string;
  onSave?: () => void;
  saveButtonDisabled?: boolean;
  component?: ElementType;
  showFooter?: boolean;
  loading?: boolean;
  buttonLabel?: string;
};

const ConfirmationModal: React.FC<Props> = ({
  onClose,
  children,
  title,
  onSave,
  showFooter = true,
  saveButtonDisabled = false,
  buttonLabel = 'Confirm',
}) => {
  return (
    <Container>
      <Box className='title-wrapper'>
        <Typography className='title'>
          <Translations text={title || ''} />
        </Typography>
      </Box>
      <Box className='content-wrapper'>{children}</Box>
      {showFooter && (
        <Box className='button-wrapper'>
          <Button variant='outlined' onClick={onClose}>
            Cancel
          </Button>
          &nbsp;
          <Button variant='contained' type='submit' disabled={saveButtonDisabled} onClick={onSave}>
            {buttonLabel}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default withModal(ConfirmationModal);
