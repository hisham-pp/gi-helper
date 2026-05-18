import { ReactElement } from 'react';
import Typography from '@mui/material/Typography';
import MaterialUITooltip from './ToolTip';
import { AttachmentTooltipProps } from './types';

const AttachmentTooltip = ({
  text,
  limit,
  showTooltip = true,
  ...rest
}: AttachmentTooltipProps) => {
  const isTextTruncated = text.length > limit;

  const truncatedText = isTextTruncated ? `${text.slice(0, limit)}...` : text;

  const Wrapper = ({ children }: { children: ReactElement }) => {
    if (showTooltip) {
      return (
        <MaterialUITooltip title={isTextTruncated ? text : ''} placement='top'>
          {children}
        </MaterialUITooltip>
      );
    }

    return <>{children}</>;
  };

  return (
    <Wrapper>
      <Typography
        component='span'
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          cursor: isTextTruncated ? 'pointer' : 'default',
        }}
        {...rest}
      >
        {truncatedText}
      </Typography>
    </Wrapper>
  );
};

export default AttachmentTooltip;
