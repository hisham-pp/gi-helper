import React, { forwardRef, useMemo, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Any, BaseOption } from '@/types';
import Translations from '../translations';
import { getBaseStyles, getBaseTheme } from './theme';
import { BaseSelectProps, ForwardBaseSelect } from './types';

function BaseSelect<T extends BaseOption>(props: BaseSelectProps<T>, ref: React.Ref<Any>) {
  const {
    label,
    placeholder = 'Choose',
    options = [],
    value,
    isMulti,
    hideSelectedOptions = false,
    closeMenuOnSelect,
    isClearable,
    isDisabled,
    isSearchable = true,
    components: passedComponents = {},
    formControlProps = {},
    onChange,
    isOptionDisabled,
    getOptionValue = (op) => String(op?.id),
    getOptionLabel = (op) => String(op?.name),
    isRequired,
    menuPosition,
    helperText,
    error = false,
    isCreatable = false,
    onCreateOption,
    customStyles = {},
    size = 'small',
    id,
  } = props;

  const theme = useTheme();

  const [isFocused, setIsFocused] = useState(false);

  const normalizedValue = useMemo(() => {
    if (isCreatable) return value;

    const findMatchingOption = (selectedOption: Any) => {
      if (!selectedOption) return null;
      const selectedOptionId = getOptionValue(selectedOption);
      return options.find((option) => getOptionValue(option) === selectedOptionId) ?? null;
    };

    if (isMulti) {
      if (!Array.isArray(value)) return [];
      return value.map((selectedOption) => findMatchingOption(selectedOption)).filter(Boolean);
    }

    if (!value || Array.isArray(value)) return null;
    return findMatchingOption(value);
  }, [getOptionValue, isCreatable, isMulti, options, value]);

  const shouldShrink = useMemo(
    () =>
      isFocused ||
      (isMulti
        ? Array.isArray(normalizedValue) && normalizedValue.length > 0
        : Boolean(normalizedValue)),
    [isFocused, normalizedValue, isMulti],
  );

  const customComponents: Any = {
    IndicatorSeparator: () => null,
    ...passedComponents,
  };

  const Select = useMemo(() => (isCreatable ? CreatableSelect : ReactSelect), [isCreatable]);

  const customGetOptionLabel = (option: Any) =>
    isCreatable && option.__isNew__ ? option.label : getOptionLabel?.(option);

  return (
    <FormControl fullWidth size='small' {...formControlProps}>
      <InputLabel
        shrink={shouldShrink}
        sx={{
          fontSize: theme.inputs.label.fontSize[size],
          // When not shrunk, center the label vertically inside the select
          ...(!shouldShrink && {
            transform: `translate(14px, ${(theme.inputs.height[size] - 16) / 2}px) scale(1)`,
          }),
          ...(shouldShrink && {
            px: 1,
            ml: -0.5,
            backgroundColor: theme.palette.common.white,
            zIndex: 1,
          }),
          '& .MuiFormLabel-asterisk': {
            color: theme.palette.error.main,
          },
          ...(error && { color: theme.palette.error.main }),
          ...(isFocused && { color: theme.palette.primary.main }),
        }}
        required={isRequired}
      >
        <Translations text={label} />
      </InputLabel>
      <Select
        menuPlacement='auto'
        ref={ref}
        options={options}
        isMulti={isMulti}
        value={normalizedValue}
        hideSelectedOptions={hideSelectedOptions}
        closeMenuOnSelect={closeMenuOnSelect}
        isClearable={isClearable}
        isSearchable={isSearchable}
        components={customComponents}
        isDisabled={isDisabled}
        placeholder={label && !shouldShrink ? '' : placeholder}
        onChange={onChange}
        styles={{
          ...getBaseStyles<T>(theme, isMulti, error, size),
          ...customStyles,
        }}
        theme={(current) => getBaseTheme(current, theme, size)}
        getOptionValue={getOptionValue}
        getOptionLabel={customGetOptionLabel}
        isOptionDisabled={isOptionDisabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        menuPosition={menuPosition}
        id={id}
        instanceId={id}
        inputId={id}
        onCreateOption={(inputValue) => {
          if (isCreatable && onCreateOption) {
            onCreateOption(inputValue);
          }
        }}
      />
      {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default forwardRef(BaseSelect) as ForwardBaseSelect;
