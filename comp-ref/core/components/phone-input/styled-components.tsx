import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const PhoneInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',

  ['& .helper-text']: {
    marginLeft: theme.spacing(1.75),
    marginRight: theme.spacing(1.75),
    marginTop: theme.spacing(0.375),
    fontSize: '0.75rem',
    lineHeight: 1.66,
    color: theme.palette.error.main,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 400,
    letterSpacing: '0.03333em',
  },

  '&.label': {
    '& .special-label': {
      '&:after': {
        color: theme.palette.error.main,
        content: '"*"',
        marginLeft: '2px',
      },
    },
  },

  // Override react-phone-input-2 styles to match MUI TextField
  '& .react-tel-input': {
    position: 'relative',
    width: '100%',

    '& .form-control': {
      width: '100%',
      height: theme.inputs.height.small, // Match MUI TextField small size
      padding: theme.inputs.padding.small,
      paddingLeft: '70px', // Space for flag dropdown (58px + 12px gap)
      fontSize: theme.inputs.fontSize.small,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 400,
      lineHeight: 1.4375,
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'}`,
      transition: theme.transitions.create(['border-color', 'box-shadow'], {
        duration: theme.transitions.duration.shorter,
      }),
      boxSizing: 'border-box',

      '&::placeholder': {
        color: theme.palette.text.disabled,
        opacity: 1,
      },

      '&:hover': {
        borderColor: theme.palette.text.primary,
      },

      '&:focus, &.open': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px',
        padding: theme.inputs.padding.small
          .split(' ')
          .map((val, idx) => (idx === 1 ? `calc(${val} - 1px)` : val))
          .join(' '),
        paddingLeft: '69px',
        outline: 'none',
      },

      // Autofill styling
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px white inset',
        WebkitTextFillColor: theme.palette.text.primary,
      },
    },

    // Flag dropdown container
    '& .flag-dropdown': {
      position: 'absolute !important',
      top: '0 !important',
      bottom: '0 !important',
      left: '0 !important',
      width: '58px !important',
      padding: '0 !important',
      backgroundColor: 'transparent !important',
      border: 'none !important',
      borderRight: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'} !important`,
      borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px !important`,
      transition: theme.transitions.create(['border-color'], {
        duration: theme.transitions.duration.shorter,
      }),

      '&:hover, &:focus': {
        backgroundColor: 'transparent !important',
      },

      // Selected flag area
      '& .selected-flag': {
        width: '58px !important',
        height: '100% !important',
        padding: '0 8px 0 2px !important',
        position: 'relative !important',
        display: 'flex !important',
        flexDirection: 'row !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        backgroundColor: 'transparent !important',
        gap: '5px !important',

        '&:hover, &:focus': {
          backgroundColor: 'transparent !important',
        },

        // Dropdown arrow
        '& > .arrow': {
          position: 'static !important',
          display: 'inline-block !important',
          width: '0 !important',
          height: '0 !important',
          margin: '0 !important',
          padding: '0 !important',
          border: 'none !important',
          borderLeft: '3px solid transparent !important',
          borderRight: '3px solid transparent !important',
          borderTop: `4px solid ${theme.palette.text.secondary} !important`,
          borderBottom: '0 !important',
          transform: 'none !important',
        },
      },

      // When dropdown is open
      '&.open .selected-flag > .arrow': {
        borderTop: '0 !important',
        borderBottom: `4px solid ${theme.palette.text.secondary} !important`,
      },
    },

    // Country list dropdown
    '& .country-list': {
      position: 'absolute !important',
      display: 'block !important',
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[8],
      marginTop: '2px !important',
      marginLeft: '0 !important',
      width: '300px !important',
      maxHeight: '200px !important',
      overflowY: 'auto !important',
      overflowX: 'hidden !important',
      zIndex: theme.zIndex.modal,
      padding: '0 !important',

      // Individual country item
      '& .country': {
        display: 'flex !important',
        flexDirection: 'row !important',
        flexWrap: 'nowrap !important',
        alignItems: 'center !important',
        padding: '10px 14px !important',
        margin: '0 !important',
        fontSize: '0.875rem !important',
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.text.primary,
        backgroundColor: 'transparent !important',
        transition: theme.transitions.create(['background-color'], {
          duration: theme.transitions.duration.shortest,
        }),
        cursor: 'pointer !important',
        width: '100% !important',
        boxSizing: 'border-box !important',
        position: 'relative !important',
        clear: 'both !important',

        '&:hover, &.highlight': {
          backgroundColor: `${theme.palette.action.hover} !important`,
        },

        // Country name
        '& .country-name': {
          display: 'inline-block !important',
          float: 'none !important',
          position: 'static !important',
          flex: '1 1 auto !important',
          minWidth: '0 !important',
          margin: '0 !important',
          padding: '0 8px 0 30px !important',
          whiteSpace: 'nowrap !important',
          overflow: 'hidden !important',
          textOverflow: 'ellipsis !important',
          verticalAlign: 'middle !important',
        },

        // Dial code
        '& .dial-code': {
          display: 'inline-block !important',
          float: 'none !important',
          position: 'static !important',
          color: `${theme.palette.text.secondary} !important`,
          flexShrink: 0,
          margin: '0 !important',
          marginLeft: 'auto !important',
          padding: '0 !important',
          verticalAlign: 'middle !important',
        },
      },

      // Search box in dropdown
      '& .search': {
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.background.paper,
        padding: '10px',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: 1,
        margin: '0 !important',
      },

      '& .search-box': {
        width: '100%',
        padding: '8px 12px',
        fontSize: '0.875rem',
        fontFamily: theme.typography.fontFamily,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        outline: 'none',
        boxSizing: 'border-box',

        '&:focus': {
          borderColor: theme.palette.primary.main,
        },
      },
    },

    // Label above input
    '& .special-label': {
      position: 'absolute !important',
      top: '0 !important',
      left: '14px !important',
      display: 'block !important',
      visibility: 'visible !important',
      backgroundColor: `${theme.palette.background.paper} !important`,
      padding: '0 5px !important',
      fontSize: `${theme.inputs.label.fontSize.small} !important`, // Use theme font size
      fontFamily: `${theme.typography.fontFamily} !important`,
      fontWeight: '400 !important',
      lineHeight: '1 !important',
      color: `${theme.palette.text.secondary} !important`,
      zIndex: '10 !important',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      transition:
        'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms !important',
      transform: 'translate(0, -9px) scale(0.75) !important',
      transformOrigin: 'top left !important',
      opacity: '1 !important',
    },
  },

  // Focused state
  '&:focus-within': {
    '& .special-label': {
      color: `${theme.palette.primary.main} !important`,
    },

    '& .flag-dropdown': {
      borderRight: `2px solid ${theme.palette.primary.main} !important`,
    },
  },

  // Error state styling
  '&.error': {
    '& .react-tel-input': {
      '& .form-control': {
        borderColor: `${theme.palette.error.main} !important`,

        '&:hover': {
          borderColor: `${theme.palette.error.main} !important`,
        },

        '&:focus': {
          borderColor: `${theme.palette.error.main} !important`,
          borderWidth: '2px',
        },
      },

      '& .flag-dropdown': {
        borderRightColor: `${theme.palette.error.main} !important`,
      },

      '& .special-label': {
        color: `${theme.palette.error.main} !important`,
      },
    },

    '&:focus-within': {
      '& .special-label': {
        color: `${theme.palette.error.main} !important`,
      },

      '& .flag-dropdown': {
        borderRight: `2px solid ${theme.palette.error.main} !important`,
      },
    },
  },

  // Disabled state styling
  '& .react-tel-input .form-control:disabled': {
    backgroundColor: `${theme.palette.action.disabledBackground} !important`,
    color: `${theme.palette.text.disabled} !important`,
    cursor: 'not-allowed',
    WebkitTextFillColor: `${theme.palette.text.disabled} !important`,
    borderColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'} !important`,

    '&:hover': {
      borderColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'} !important`,
    },
  },

  '&:has(.form-control:disabled)': {
    '& .special-label': {
      color: `${theme.palette.text.disabled} !important`,
    },

    '& .flag-dropdown': {
      cursor: 'not-allowed',
      opacity: 0.6,
      borderRightColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'} !important`,
    },
  },
}));
