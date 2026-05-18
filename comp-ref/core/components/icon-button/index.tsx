import { forwardRef, Fragment, memo } from 'react';
import MUIIconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Props, WrapperProps } from './types';

const Wrapper = memo(({ toolTip, children }: WrapperProps) => {
  if (toolTip) return <Tooltip title={toolTip}>{children}</Tooltip>;

  return <Fragment>{children}</Fragment>;
});

Wrapper.displayName = 'Wrapper';

const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(props, ref) {
  const { toolTip, sx = {}, iconSize = 20, id, ...rest } = props;

  return (
    <Wrapper toolTip={toolTip}>
      <MUIIconButton
        ref={ref}
        id={id}
        sx={{ ['& svg']: { fontSize: `${iconSize}px` }, ...sx }}
        {...rest}
      />
    </Wrapper>
  );
});

export default memo(IconButton);
