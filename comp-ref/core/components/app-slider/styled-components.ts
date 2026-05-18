import { FormControl } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StyledFormControlProps {
  error?: boolean;
}

export const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop) => prop !== 'error',
})<StyledFormControlProps>(({ theme, error }) => ({
  width: '100%',

  '& .label-container': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },

  '& .label': {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: error ? theme.palette.error.main : theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),

    '&.required:after': {
      content: '"*"',
      color: theme.palette.error.main,
      marginLeft: theme.spacing(0.5),
    },
  },

  '& .value-text': {
    fontWeight: 600,
    color: error ? theme.palette.error.main : theme.palette.primary.main,
    minWidth: 40,
    textAlign: 'right',
    fontSize: '0.875rem',
  },

  '& .value-input': {
    minWidth: 40,
    width: 40,

    '& .MuiInputBase-root': {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: error ? theme.palette.error.main : theme.palette.primary.main,
    },

    '& .MuiInputBase-input': {
      textAlign: 'right',
      padding: theme.spacing(0.5, 1),
      height: 'auto',
    },

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: error ? theme.palette.error.main : theme.palette.grey[300],
    },

    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
    },

    '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
      borderWidth: 1,
    },
  },

  '& .slider-container': {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  '& .MuiSlider-root': {
    color: error ? theme.palette.error.main : theme.palette.primary.main,
  },

  '& .MuiSlider-thumb': {
    width: 20,
    height: 20,
  },

  '& .MuiSlider-rail': {
    opacity: 0.5,
    backgroundColor: theme.palette.grey[400],
  },

  '& .MuiSlider-mark': {
    backgroundColor: theme.palette.grey[500],
    height: 8,
    width: 2,
  },

  '& .MuiSlider-markLabel': {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },

  '& .helper-text': {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
}));
