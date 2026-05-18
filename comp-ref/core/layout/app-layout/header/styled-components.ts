'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import colors from '@/utils/colors';

type StyledTileProps = {
  isUnread: boolean;
};

export const ProfileBadge = styled('div')(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.primary.main,
  overflow: 'hidden',
  cursor: 'pointer',
}));

export const HeaderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2.5, 5),

  '& .title-end': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2),
  },
}));

export const NotificationHeaderContainer = styled(Grid)(({ theme: { palette, spacing } }) => ({
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: spacing(0, 4),
  position: 'sticky',
  top: 0,
  background: palette.background.paper,
  height: 55,
  zIndex: 5,

  '& .styled-link': {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: 13,
    color: palette.common.black,
    fontWeight: 700,
  },
}));
export const StyledTile = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUnread',
})<StyledTileProps>(({ theme, isUnread }) => ({
  padding: theme.spacing(2, 5),
  cursor: 'pointer',
  transition: 'background 250ms',

  ...(isUnread && {
    backgroundColor: colors.lightShades.lightMist,
  }),

  ':hover': {
    backgroundColor: theme.palette.grey[200],
  },

  '& .title': {
    fontSize: 15,
    fontWeight: theme.typography.fontWeightMedium,
  },

  '& .unread-title': {
    fontWeight: theme.typography.fontWeightBold,
  },
  '& .unread-container': {
    backgroundColor: theme.palette.grey[200],
  },

  '& .title-wrapper': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },

  '& .short-message': {
    color: theme.palette.grey[600],
    fontSize: 12,
    lineHeight: 1.3,
    marginTop: 2,
  },

  '& .unread-short-message': {
    fontWeight: theme.typography.fontWeightMedium,
  },

  '& .notified-day': {
    color: theme.palette.grey[500],
    fontSize: 13,
  },

  '& .unread-notified-day': {
    fontWeight: theme.typography.fontWeightMedium,
  },
}));
