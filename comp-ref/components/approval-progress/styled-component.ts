import { Box, BoxProps, styled } from '@mui/material';

type ApprovalDotWrapperProps = BoxProps & {
  dotSize: number;
  isApproved: boolean;
  isRejected: boolean;
  lineWidth: number;
  isPending: boolean;
};

type TooltipContentWrapperProps = BoxProps & {
  isApproved: boolean;
  isRejected: boolean;
};

export const TimelineWrapper = styled(Box)<BoxProps>(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 0,
  minWidth: 'fit-content',
  flexWrap: 'nowrap',
}));

export const ApprovalDotWrapper = styled(Box, {
  shouldForwardProp: (prop) =>
    !['dotSize', 'isApproved', 'isRejected', 'lineWidth', 'isPending'].includes(prop as string),
})<ApprovalDotWrapperProps>(({ dotSize, isApproved, isRejected, lineWidth, isPending, theme }) => {
  const lineColor = () => {
    if (isApproved) return theme.palette.primary.main;
    if (isRejected) return theme.palette.error.main;
    return theme.palette.action.disabled;
  };

  const dotColor = () => {
    if (isApproved) return theme.palette.primary.main;
    if (isRejected) return theme.palette.error.main;
    return theme.palette.action.disabled;
  };

  return {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',

    ['& .approval-dot']: {
      width: dotSize,
      height: dotSize,
      borderRadius: '50%',
      backgroundColor: isApproved || isRejected ? dotColor() : 'transparent',
      border: `2px solid ${dotColor()}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      zIndex: 1,

      ['&:hover']: {
        transform: 'scale(1.2)',
        boxShadow: `0 0 8px ${dotColor()}`,
      },
    },

    ['& .approval-line']: {
      width: lineWidth,
      height: 2,
      backgroundColor: isApproved || isRejected ? lineColor() : 'transparent',
      borderTop: isPending ? `2px dashed ${lineColor()}` : 'none',
      marginInlineStart: '2px',
      marginInlineEnd: '2px',
    },
  };
});

export const TooltipContentWrapper = styled(Box, {
  shouldForwardProp: (props) => !['isApproved', 'isRejected'].includes(props as string),
})<TooltipContentWrapperProps>(({ theme, isApproved, isRejected }) => ({
  padding: theme.spacing(1),
  minWidth: 100,

  ['& .name-container']: {
    marginBottom: theme.spacing(0.5),

    ['& .name']: {
      fontSize: 14,
      fontWeight: 600,
      color: theme.palette.common.black,

      ['& span']: {
        fontSize: 13,
        marginInlineStart: theme.spacing(0.5),
        color: theme.palette.text.secondary,
      },

      ['& .cancelled']: {
        color: theme.palette.error.main,
      },
    },
  },

  ['& .date-container']: {
    marginBottom: theme.spacing(0.5),

    ['& .date']: {
      fontSize: 12,
      color: theme.palette.text.secondary,
    },
  },

  ['& .status-container']: {
    ['& .status']: {
      fontSize: 12,
      fontWeight: 600,
      color: isApproved
        ? theme.palette.success.main
        : isRejected
          ? theme.palette.error.main
          : theme.palette.warning.main,
    },
  },
}));
