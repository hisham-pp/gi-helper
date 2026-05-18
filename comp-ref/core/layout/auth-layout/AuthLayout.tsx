import { AuthWrapper } from './styled-components';
import { Props } from './types';

const AuthLayoutComponent: React.FC<Props> = ({ children, boxProps }) => {
  return <AuthWrapper {...boxProps}>{children}</AuthWrapper>;
};

export default AuthLayoutComponent;
