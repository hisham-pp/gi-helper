import { Box, styled } from '@mui/material';

export const TileCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 16,
  padding: '28px 20px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(52, 152, 219, 0.15)',
    borderColor: theme.palette.primary.main,
  },
}));

export const TileIconWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const TileContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const TileTitle = styled(Box)(({ theme }) => ({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const QuickNavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 64px)',
  padding: '40px 20px',
  position: 'relative',
  background: theme.palette.background.default,
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        ${theme.palette.primary.main}33 0,
        ${theme.palette.primary.main}33 1px,
        transparent 1px,
        transparent 40px
      ),
      repeating-linear-gradient(
        90deg,
        ${theme.palette.primary.main}33 0,
        ${theme.palette.primary.main}33 1px,
        transparent 1px,
        transparent 40px
      )
    `,
    backgroundSize: '100% 100%, 100% 100%',
    backgroundPosition: '0 0, 0 0',
    maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

export const ModuleContainer = styled(Box)({
  maxWidth: 1000,
  width: '100%',
});

export const QuickNavGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 10,
  padding: '0 20px',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const QuickNavHeader = styled(Box)({
  textAlign: 'center',
  marginBottom: 50,
});

export const BrandLogoImage = styled('img')({
  height: 80,
  marginBottom: '1rem',
});

export const QuickNavTitle = styled(Box)(({ theme }) => ({
  fontSize: '1.375rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  letterSpacing: '-0.02em',
}));

export const QuickNavSubtitle = styled(Box)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.text.primary,
  opacity: 0.9,
  marginTop: theme.spacing(0.5),
}));
