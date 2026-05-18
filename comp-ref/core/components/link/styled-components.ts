import NextLink from 'next/link';
import { styled } from '@mui/material/styles';

export const Link = styled(NextLink)(() => ({
  color: '#29ACE3',
  fontSize: '13px',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));
