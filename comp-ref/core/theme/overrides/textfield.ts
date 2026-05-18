import { Theme } from '@mui/material/styles';

const MuiTextField = () => {
  return {
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '& .MuiInputBase-sizeSmall': {
            fontSize: theme.inputs.fontSize.small,
            minHeight: theme.inputs.height.small,
          },
          '& .MuiInputBase-sizeMedium': {
            fontSize: theme.inputs.fontSize.medium,
            minHeight: theme.inputs.height.medium,
          },
          '& .MuiInputBase-sizeLarge': {
            fontSize: theme.inputs.fontSize.large,
            minHeight: theme.inputs.height.large,
          },
          '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
            '& input': {
              padding: theme.inputs.padding.small,
              fontSize: theme.inputs.fontSize.small,
            },
            '& textarea': {
              fontSize: theme.inputs.fontSize.small,
            },
          },
          '& .MuiOutlinedInput-root.MuiInputBase-sizeMedium': {
            '& input': {
              padding: theme.inputs.padding.medium,
              fontSize: theme.inputs.fontSize.medium,
            },
            '& textarea': {
              fontSize: theme.inputs.fontSize.medium,
            },
          },
          '& .MuiOutlinedInput-root.MuiInputBase-sizeLarge': {
            '& input': {
              padding: theme.inputs.padding.large,
              fontSize: theme.inputs.fontSize.large,
            },
            '& textarea': {
              fontSize: theme.inputs.fontSize.large,
            },
          },
          '& .MuiInputLabel-sizeSmall': {
            fontSize: theme.inputs.label.fontSize.small,
          },
          '& .MuiInputLabel-sizeMedium': {
            fontSize: theme.inputs.label.fontSize.medium,
          },
          '& .MuiInputLabel-sizeLarge': {
            fontSize: theme.inputs.label.fontSize.large,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '&.MuiInputBase-sizeSmall': {
            minHeight: theme.inputs.height.small,
          },
          '&.MuiInputBase-sizeMedium': {
            minHeight: theme.inputs.height.medium,
          },
          '&.MuiInputBase-sizeLarge': {
            minHeight: theme.inputs.height.large,
          },
        }),
        input: ({ theme }: { theme: Theme }) => ({
          '&.MuiInputBase-inputSizeSmall': {
            padding: theme.inputs.padding.small,
            fontSize: theme.inputs.fontSize.small,
          },
          '&.MuiInputBase-inputSizeMedium': {
            padding: theme.inputs.padding.medium,
            fontSize: theme.inputs.fontSize.medium,
          },
          '&.MuiInputBase-inputSizeLarge': {
            padding: theme.inputs.padding.large,
            fontSize: theme.inputs.fontSize.large,
          },
        }),
      },
    },
  };
};

export default MuiTextField;
