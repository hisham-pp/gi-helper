import { Box, BoxProps, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

type StyledEditorWrapperProps = BoxProps & {
  minEditorHeight?: string;
};

export const HeaderContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),

  '& .header': {
    fontSize: 14,
    color: theme.palette.text.secondary,
  },
}));

export const StyledEditorWrapper = styled(Box, {
  shouldForwardProp: (prop: PropertyKey) => prop !== 'minEditorHeight',
})<StyledEditorWrapperProps>(({ theme, minEditorHeight }) => ({
  '& .ql-toolbar': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
  },
  '& .ql-container': {
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  '& .ql-editor': {
    minHeight: minEditorHeight || 'auto',
  },
}));
