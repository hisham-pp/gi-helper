import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import colors from '@/utils/colors';

export const StyledSidebarPaper = styled(Paper)(({ theme }) => ({
  width: '250px',
  position: 'sticky',
  top: '0',
  overflowY: 'auto',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  boxShadow: 'none',
  borderRight: `1px solid ${theme.palette.grey[300]}`,
}));

export const StyledNavItem = styled('li')<{ active: boolean }>(({ theme, active }) => ({
  color: active ? theme.palette.primary.dark : theme.palette.text.secondary,
  backgroundColor: active ? colors.lightShades.paleBlue : colors.common.white,
  cursor: 'pointer',
  marginBottom: theme.spacing(1),
  borderLeft: active ? `3px solid ${theme.palette.primary.dark}` : '',
  height: '40px',
  padding: theme.spacing(0, 1.25),
  borderRadius: '2px',
  transition: 'background-color 0.3s',
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
}));

export const StyledSection = styled('section')(({ theme }) => ({
  marginBottom: theme.spacing(1.25),
  padding: theme.spacing(2.5),
}));

export const StyledContentPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2.5),
  overflowY: 'auto',
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  boxShadow: 'none',
}));
