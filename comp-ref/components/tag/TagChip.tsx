import React from 'react';
import { InfoTip } from '../tool-tip';
import { StyledChip } from './styled-components';
import { TagChipProps } from './types';

const TagChip: React.FC<TagChipProps> = ({ name = '', color = '', truncate = true }) => {
  const isTruncated = truncate && name?.length > 10;
  const displayLabel = isTruncated ? `${name?.slice(0, 10)}...` : name;

  const chipComponent = <StyledChip label={displayLabel} sx={{ backgroundColor: color }} />;

  return isTruncated ? (
    <InfoTip title={name} arrow>
      {chipComponent}
    </InfoTip>
  ) : (
    chipComponent
  );
};

export default TagChip;
