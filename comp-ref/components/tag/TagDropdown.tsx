import React from 'react';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { components } from 'react-select';
import BaseSelect from '@/core/components/app-select/BaseSelect';
import { TagOption } from './styled-components';
import { TagDropdownProps, TagValue } from './types';
import { TagChip } from '.';

const TagDropdown: React.FC<TagDropdownProps> = ({
  isMulti = true,
  value,
  options,
  onChange,
  isRequired,
  helperText,
  error = false,
  isCreatable,
  onCreateOption,
}) => {
  return (
    <BaseSelect
      isMulti={isMulti}
      isClearable={false}
      closeMenuOnSelect
      hideSelectedOptions
      label='Select Tags'
      options={options}
      value={value}
      onChange={onChange}
      isRequired={isRequired}
      isCreatable={isCreatable}
      onCreateOption={onCreateOption}
      error={error}
      helperText={helperText}
      components={{
        Option: ({ children, data, ...props }) => {
          const { innerProps, isFocused, innerRef } = props;

          return (
            <TagOption ref={innerRef} isFocused={isFocused} {...innerProps}>
              <Chip
                sx={{
                  backgroundColor: (data as { color: string })?.color,
                  width: 21,
                  height: 21,
                  borderRadius: 1,
                }}
              />
              <Typography className='label'>{children}</Typography>
            </TagOption>
          );
        },

        SingleValue: ({ ...props }) => {
          const data = props?.data as TagValue;

          return (
            <components.SingleValue {...props}>
              <TagChip color={data?.color} name={data?.name} />
            </components.SingleValue>
          );
        },
      }}
    />
  );
};

export default TagDropdown;
