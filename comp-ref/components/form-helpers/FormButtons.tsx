import { FC } from 'react';
import { CircularProgress } from '@mui/material';
import Button, { ButtonProps } from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Translations from '@/core/components/translations';

type FormButtonProps = {
  onCancel?: () => void;
  onSave?: () => void;
  saveButtonDisabled?: boolean;
  isLoading?: boolean;
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
  saveButtonType?: ButtonProps['type'];
  size?: ButtonProps['size'];
};

const FormButtons: FC<FormButtonProps> = ({
  onCancel,
  onSave,
  saveButtonDisabled,
  isLoading = false,
  saveButtonLabel = 'Save',
  cancelButtonLabel = 'Cancel',
  saveButtonType = 'submit',
  size = 'medium',
}) => {
  return (
    <Grid>
      <Button variant='outlined' onClick={onCancel} size={size} sx={{ minWidth: 150 }}>
        <Translations text={cancelButtonLabel} />
      </Button>
      &nbsp;&nbsp;
      <Button
        type={saveButtonType}
        variant='contained'
        size={size}
        disabled={saveButtonDisabled}
        onClick={onSave}
        sx={{ minWidth: 150 }}
      >
        <Translations text={saveButtonLabel} />
        {isLoading && <CircularProgress size='20px' color='secondary' sx={{ ml: '4px' }} />}
      </Button>
    </Grid>
  );
};

export default FormButtons;
