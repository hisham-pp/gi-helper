import { ButtonProps } from '@mui/material/Button';

export type AppButtonProps = ButtonProps & { loading?: boolean; loaderColor?: string };
