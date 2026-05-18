import React, { useMemo } from 'react';
import { BaseOption } from '@/types';
import AppCheckbox from '../app-checkbox';
import BaseSelect from './BaseSelect';
import { CheckOption, CountBadge } from './styled-components';
import { BaseSelectProps } from './types';

const SELECT_ALL_OPTION = { id: '*', name: 'All' };

function CheckboxSelect({
  options = [],
  chipCount = 0,
  onChange = () => {},
  showSelectAll = true,
  ...props
}: BaseSelectProps<BaseOption> & { showSelectAll?: boolean }) {
  const selectOptions = useMemo(
    () => (options?.length >= 1 && showSelectAll ? [SELECT_ALL_OPTION, ...options] : options),
    [options, showSelectAll],
  );

  return (
    <BaseSelect
      isMulti
      isClearable={false}
      closeMenuOnSelect={false}
      options={selectOptions}
      onChange={onChange}
      {...props}
      components={{
        Option: ({ children, data, ...props }) => {
          const { innerProps, isFocused, innerRef, getValue } = props;
          const { onClick = () => {}, ...restInnerProps } = innerProps;

          const selectedValues = getValue();
          const isSelectAllOption = (data as { id: string })?.id === SELECT_ALL_OPTION.id;
          const isAllSelected = selectedValues?.length === options?.length;

          const handleOptionClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (isSelectAllOption) {
              onChange(isAllSelected ? [] : options, undefined);
            } else {
              onClick(e);
            }
          };

          return (
            <CheckOption
              ref={innerRef}
              isFocused={isFocused}
              onClick={handleOptionClick}
              {...restInnerProps}
            >
              <AppCheckbox
                checked={isSelectAllOption ? isAllSelected : props?.isSelected}
                onChange={() => null}
              />
              {children}
            </CheckOption>
          );
        },

        MultiValueContainer: ({ data, ...props }) => {
          const selectedOptions = props.selectProps.value as BaseOption[];
          const firstSelectedIndex = selectedOptions?.findIndex((option) => option?.id === data.id);

          if (firstSelectedIndex === 0) {
            return (
              <CountBadge>{`${chipCount ? chipCount : selectedOptions?.length} Selected`}</CountBadge>
            );
          }

          return null;
        },
      }}
    />
  );
}

export default CheckboxSelect;
