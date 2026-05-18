import { OwnerStateThemeType } from './button';

const Switch = () => {
  return {
    MuiSwitch: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          height: 30, // Increased height
          padding: 0,

          '& .MuiSwitch-track': {
            width: 55, // Increased width
            height: 30, // Increased height
            opacity: 1,
            borderRadius: 30,
            backgroundColor: 'transparent',
            padding: 0,
            border: `1px solid ${theme.palette.text.disabled}`,
            transition: 'left .15s ease-in-out, transform .15s ease-in-out',
          },
        }),
        switchBase: ({ theme }: OwnerStateThemeType) => ({
          top: 4, // Adjusted top positioning
          left: 5, // Adjusted left positioning
          padding: `${theme.spacing(0)} !important`, // Adjusted padding
          color: theme.palette.primary.main,
          transition: 'left .15s ease-in-out, transform .15s ease-in-out',
          '&:hover': {
            backgroundColor: 'transparent !important',
          },
          '& .MuiSwitch-input': {
            left: '-50%',
            width: '250%',
          },
          '&.Mui-disabled': {
            opacity: 0.4,
            color: theme.palette.text.disabled,
            '& + .MuiSwitch-track': {
              opacity: 0.5,
            },
            '&.Mui-checked': {
              opacity: theme.palette.mode === 'dark' ? 0.5 : 0.9,
              '& + .MuiSwitch-track': {
                opacity: 0.3,
                boxShadow: 'none',
              },
            },
          },
          '&.Mui-checked': {
            left: 8, // Adjusted left positioning for checked state
            color: `${theme.palette.common.white} !important`,
            '& .MuiSwitch-input': {
              left: '-100%',
            },
            '& + .MuiSwitch-track': {
              opacity: 1,
              borderColor: theme.palette.secondary.main,
              background: theme.palette.gradients?.primary,
            },
            '&.MuiSwitch-colorSecondary + .MuiSwitch-track': {
              borderColor: theme.palette.secondary.main,
              backgroundColor: theme.palette.secondary.main,
            },
            '&.MuiSwitch-colorSuccess + .MuiSwitch-track': {
              borderColor: theme.palette.success.main,
              backgroundColor: theme.palette.success.main,
            },
            '&.MuiSwitch-colorError + .MuiSwitch-track': {
              borderColor: theme.palette.error.main,
              backgroundColor: theme.palette.error.main,
            },
            '&.MuiSwitch-colorWarning + .MuiSwitch-track': {
              borderColor: theme.palette.warning.main,
              backgroundColor: theme.palette.warning.main,
            },
            '&.MuiSwitch-colorInfo + .MuiSwitch-track': {
              borderColor: theme.palette.info.main,
              backgroundColor: theme.palette.info.main,
            },
          },
        }),
        thumb: {
          width: 22, // Increased thumb width
          height: 22, // Increased thumb height
          boxShadow: 'none',
        },
        sizeSmall: {
          width: 48, // Increased small size width
          height: 36, // Increased small size height
          '& .MuiSwitch-track': {
            width: 34, // Increased track width for small size
            height: 22, // Increased track height for small size
          },
          '& .MuiSwitch-thumb': {
            width: 16, // Increased thumb width for small size
            height: 16, // Increased thumb height for small size
          },
          '& .MuiSwitch-switchBase': {
            top: 9, // Adjusted top positioning for small size
            left: 9, // Adjusted left positioning for small size
            '&.Mui-checked': {
              left: 0, // Adjusted left positioning for checked state in small size
            },
          },
        },
      },
    },
  };
};

export default Switch;
