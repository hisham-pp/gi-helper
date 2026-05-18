'use client';

import { IconButton, IconButtonProps, Paper, PaperProps } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import hexToRGBA from '@/utils/hex-to-rgba';

type NavItemWrapperProps = {
  active?: boolean;
  isGroupItem?: boolean;
  isGroupItemActive?: boolean;
  navCollapsed?: boolean;
};

interface VerticalNavContainerProps extends PaperProps {
  isRTL?: boolean;
  isTablet?: boolean;
  isMobile?: boolean;
  navCollapsed?: boolean;
}

type NavCollapseButtonProps = IconButtonProps & {
  isCollapsedAndNotHovered: boolean;
  isTablet?: boolean;
  isCollapsed?: boolean;
};

export const NavScrollContainer = styled(Box)(() => ({
  display: 'flex',
  overflow: 'visible',
  height: '100%',
  justifyContent: 'flex-start',
  flexDirection: 'column',
  padding: '4px',

  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'contain',
  touchAction: 'pan-y',

  '::-webkit-scrollbar': {
    display: 'none',
  },
}));

export const NavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
}));

export const NavItemWrapper = styled(Box, {
  shouldForwardProp: (prop) =>
    prop === 'id' ||
    (prop !== 'active' &&
      prop !== 'isGroupItemActive' &&
      prop !== 'isGroupItem' &&
      prop !== 'navCollapsed'),
})<NavItemWrapperProps>(({ theme, active, isGroupItem, isGroupItemActive, navCollapsed }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  position: 'relative',
  padding: navCollapsed ? theme.spacing(1.5, 1) : '12px 20px',
  width: '100%',
  justifyContent: navCollapsed ? 'center' : 'flex-start',
  gap: navCollapsed ? 0 : '12px',
  transition: 'all 0.2s ease',
  color: theme.palette.text.primary,

  // Left border indicator (hidden by default, shows on hover/active)
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    background: theme.palette.primary.main,
    transform: active ? 'scaleY(1)' : 'scaleY(0)',
    transition: 'transform 0.2s ease',
  },

  // Hover state
  '&:hover': {
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.06),
    '&::before': {
      transform: 'scaleY(1)',
    },
    '& svg': {
      color: theme.palette.primary.main,
    },
  },

  // Active state
  ...(active && {
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.06),
    fontWeight: 700,
  }),

  // Hide group items when collapsed
  ...(navCollapsed &&
    isGroupItem && {
      display: 'none',
    }),

  // Icon styling - larger when collapsed for better visibility
  '& svg': {
    width: navCollapsed ? '22px' : '18px',
    height: navCollapsed ? '22px' : '18px',
    flexShrink: 0,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: 'color 0.2s ease, width 0.2s ease, height 0.2s ease',
  },

  // Reduce icon size on mobile
  [theme.breakpoints.down('sm')]: {
    '& svg': {
      width: navCollapsed ? '18px' : '16px',
      height: navCollapsed ? '18px' : '16px',
    },
  },

  // Text styling
  '& .link-text': {
    fontSize: '15px',
    whiteSpace: 'nowrap',
    color: 'inherit',
    ...(isGroupItem && {
      color: '#1c1c1e',
      fontSize: '14px',
    }),
    ...(isGroupItemActive && {
      color: '#1c1c1e',
      fontWeight: 700,
    }),
  },

  // Group item bullet - same color scheme as icon
  '& .disk': {
    fontSize: '8px',
    marginRight: theme.spacing(1),
    color: isGroupItemActive
      ? theme.palette.primary.main
      : active
        ? theme.palette.primary.main
        : theme.palette.text.secondary,
  },

  '& .drop-down-open': {
    transform: 'rotate(90deg)',
  },
}));

export const GroupWrapper = styled(Box)(({ theme }) => ({
  '& .title': {
    marginBottom: theme.spacing(1.5),
    fontWeight: theme.typography.fontWeightMedium,
  },

  '& .item-container': {
    flexWrap: 'wrap',
    maxHeight: 360,
  },

  '& .item': {
    minWidth: 200,
  },
}));

export const VerticalNavContainer = styled(Paper, {
  shouldForwardProp: (prop) =>
    !['isRTL', 'isTablet', 'isMobile', 'navCollapsed'].includes(prop as string),
})<VerticalNavContainerProps>(({ theme, isRTL, isMobile, navCollapsed }) => {
  // On mobile expanded: show as overlay with higher z-index
  const isMobileExpanded = isMobile && !navCollapsed;

  return {
    // Fixed positioning - sidebar stays in place while content scrolls
    position: 'fixed',
    top: 0,
    left: isRTL ? 'auto' : 0,
    right: isRTL ? 0 : 'auto',
    height: '100vh',
    zIndex: isMobileExpanded ? 1300 : 1000,

    // Layout
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,

    // Border
    borderRight: isRTL ? 0 : `1px solid ${theme.palette.divider}`,
    borderLeft: isRTL ? `1px solid ${theme.palette.divider}` : 0,
    borderRadius: 0,

    // Mobile: slide in/out animation using transform
    ...(isMobile && {
      width: '250px !important',
      transform: navCollapsed ? `translateX(${isRTL ? '100%' : '-100%'})` : 'translateX(0)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform',
    }),

    // Desktop/tablet: transition for width changes
    ...(!isMobile && {
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'width',
    }),

    // Box shadow for depth
    boxShadow: '4px 0 12px rgba(0, 0, 0, 0.08)',

    '& .nav-wrapper': {
      flexGrow: 1,
      minHeight: 0,
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',

      // iOS prevent elastic bounce effect
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
      touchAction: 'pan-y',

      '::-webkit-scrollbar': {
        width: '6px',
      },

      '::-webkit-scrollbar-track': {
        background: 'transparent',
      },

      '::-webkit-scrollbar-thumb': {
        background: theme.palette.divider,
        borderRadius: '3px',
        '&:hover': {
          background: 'rgba(0, 0, 0, 0.3)',
        },
      },
    },
  };
});

export const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Toggle button at bottom
type SidebarToggleProps = {
  isCollapsed?: boolean;
};

export const SidebarToggle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCollapsed',
})<SidebarToggleProps>(({ theme }) => ({
  position: 'static',
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  zIndex: 10,

  '&:hover': {
    background: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
  },

  '& svg': {
    color: theme.palette.text.primary,
  },
}));

export const SidebarFooter = styled(Box)(({ theme }) => ({
  height: 72,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.background.paper,
}));

export const NavCollapseButton = styled(IconButton, {
  shouldForwardProp: (prop) =>
    prop !== 'isCollapsedAndNotHovered' && prop !== 'isTablet' && prop !== 'isCollapsed',
})<NavCollapseButtonProps>(({ theme, isTablet, isCollapsed }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  width: isCollapsed ? 'auto' : '100%',
  height: 'auto',
  minWidth: 'auto',
  minHeight: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: isTablet ? 'bounce 1s ease-in-out infinite' : 'none',

  // Simple bounce animation
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateX(0)',
    },
    '50%': {
      transform: 'translateX(3px)',
    },
  },

  '&:hover': {
    backgroundColor: theme.palette.action.hover,

    '& svg': {
      color: theme.palette.primary.dark,
    },
  },

  '& svg': {
    fontSize: '1.25rem',
    color: theme.palette.primary.main,
    transition: 'color 0.3s ease-in-out',
    display: 'block',
    lineHeight: 1,
  },
}));
