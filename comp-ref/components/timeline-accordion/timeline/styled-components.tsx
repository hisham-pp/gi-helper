import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import colors from '@/utils/colors';

const timelineWidth = 3;
const { lightShades, darkShades } = colors;

export const TimelineEventContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isLast',
})<{ isLast?: boolean }>(({ isLast }) => ({
  position: 'relative',
  marginLeft: 40,
  marginTop: 12,
  marginBottom: isLast ? 12 : 23,
  paddingBottom: isLast ? 0 : 16,
}));

export const TimelineLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPassed',
})<{ isPassed?: boolean }>(({ theme, isPassed }) => ({
  position: 'absolute',
  left: -23.5,
  top: 5,
  bottom: -27,
  width: timelineWidth,
  ...(isPassed
    ? {
        backgroundColor: theme.palette.primary.main,
      }
    : {
        borderLeft: `${timelineWidth}px dashed ${theme.palette.action.disabledBackground}`,
      }),
}));

export const TimelineEventHeader = styled(Box)(({ theme }) => ({
  paddingLeft: 10,

  '& .name': {
    fontSize: '14px',
    fontWeight: theme.typography.fontWeightMedium,

    '& span': {
      color: theme.palette.text.disabled,

      '&.cancelled': {
        color: theme.palette.error.main,
      },
    },
  },

  '& .associate-date': {
    fontSize: '13px',
    color: theme.palette.text.disabled,
  },
}));

export const TimelineEventTime = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const TimelineDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPassed',
})<{ isPassed?: boolean }>(({ theme, isPassed }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: `${timelineWidth}px solid`,
  position: 'absolute',
  left: -28,
  top: 4,
  backgroundColor: isPassed ? theme.palette.primary.main : theme.palette.common.white,
  borderColor: isPassed ? theme.palette.primary.main : theme.palette.action.disabled,
}));

export const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: lightShades?.lightMist,
  },

  [`& .${tooltipClasses.tooltip}`]: {
    zIndex: 9999,
    fontSize: 12,
    textAlign: 'center',
    margin: '0px !important',
    boxShadow: theme.shadows[4],
    padding: theme.spacing(3, 4),
    color: theme.palette.common.white,
    backgroundColor: darkShades.charcoalBlue,
  },
}));
