import { Theme as MuiTheme } from '@mui/material/styles';
import { GroupBase, StylesConfig, Theme } from 'react-select';
import { BaseOption } from '@/types';
import { SelectSize } from './types';

type ColorOption = BaseOption & { color?: string };

export const getBaseStyles = <T extends BaseOption>(
  theme: MuiTheme,
  isMulti?: boolean,
  error?: boolean,
  size: SelectSize = 'small',
): StylesConfig<T, boolean, GroupBase<T>> => {
  // Use theme.inputs configuration
  const controlHeight = theme.inputs.height[size];
  const fontSize = theme.inputs.fontSize[size];
  const padding = theme.inputs.padding[size];

  // Parse padding values
  const [_, horizontalPadding] = padding.split(' ');
  const valueContainerPadding = `2px ${horizontalPadding}`; // Match TextField padding
  const optionPadding = padding;

  const config = {
    controlHeight,
    fontSize,
    optionPadding,
    valueContainerPadding,
  };
  return {
    option: (base, state) => ({
      ...base,
      fontSize: config.fontSize,
      padding: config.optionPadding,
      minHeight: config.controlHeight,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      boxSizing: 'border-box',
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      backgroundColor: state.isSelected
        ? theme.palette.primary.main
        : state.isFocused
          ? theme.palette.action.hover
          : 'transparent',
      color: state.isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
      ':active': {
        backgroundColor: state.isSelected
          ? theme.palette.primary.main
          : theme.palette.action.selected,
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.palette.text.disabled,
      fontSize: config.fontSize,
      margin: 0,
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
    }),
    input: (base) => ({
      ...base,
      fontSize: config.fontSize,
      margin: 0,
      padding: 0,
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: config.fontSize,
      margin: 0,
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.palette.text.primary,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: config.valueContainerPadding,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      overflow: 'hidden',
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[17],
      border: `1px solid ${theme.palette.divider}`,
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
      maxHeight: '200px',
      overflowY: 'auto',
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        background: theme.palette.divider,
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: theme.palette.action.hover,
      },
    }),
    multiValue: (base, { data }) => {
      const colorOption = data as ColorOption;
      return {
        ...base,
        backgroundColor: colorOption.color || theme.palette.primary.main,
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.common.white,
        paddingLeft: '4px',
      };
    },
    container: (base) => ({
      ...base,
      width: '100%',
    }),
    control: (base, state) => ({
      ...base,
      width: '100%',
      minHeight: config.controlHeight,
      paddingRight: horizontalPadding, // Add right padding to match TextField
      ...(error && {
        borderColor: theme.palette.error.main,
      }),
      ...(state.isDisabled && {
        backgroundColor: 'hsl(0, 0%, 98%)',
      }),
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme.palette.common.white,
      padding: '3px 6px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      cursor: 'pointer',
      ':hover': {
        backgroundColor: theme.palette.error.main,
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    dropdownIndicator: (base) => ({
      ...base,
      paddingRight: '8px',
      paddingLeft: '0px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    clearIndicator: (base) => ({
      ...base,
      paddingRight: '8px',
      paddingLeft: '0px',
      cursor: 'pointer',
      color: theme.palette.text.secondary,
      ':hover': {
        color: theme.palette.error.main,
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: config.fontSize,
      padding: config.optionPadding,
      minHeight: config.controlHeight,
    }),
  };
};

export function getBaseTheme(
  currentTheme: Theme,
  theme: MuiTheme,
  size: SelectSize = 'small',
): Theme {
  const controlHeight = theme.inputs.height[size];
  return {
    ...currentTheme,
    borderRadius: Number(theme.shape.borderRadius),
    spacing: { ...currentTheme.spacing, controlHeight, baseUnit: 2 },
    colors: {
      ...currentTheme.colors,
      primary: theme.palette.primary.main,
      primary25: theme.palette.action.hover,
      danger: theme.palette.error.main,
    },
  };
}
