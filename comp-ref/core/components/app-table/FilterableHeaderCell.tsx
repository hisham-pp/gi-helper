import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  Select,
  TableCell,
  TextField,
} from '@mui/material';
import AppDatePicker from '../app-date-picker';
import { AppSelect } from '../app-select';
import Icon from '../icon';
import Translations from '../translations';
import { FilterableHeaderCellProps, FilterType, FilterValue } from './types';

/**
 * FilterableHeaderCell Component
 * Renders a table header with an optional inline filter input
 * Supports text, dropdown, multi-select, and date range filters
 */
export const FilterableHeaderCell: React.FC<FilterableHeaderCellProps> = ({
  header,
  columnKey,
  filterConfig,
  currentFilterValue,
  onFilterChange,
  cellProps = {},
}) => {
  const { sx, ...rest } = cellProps;
  const [localValue, setLocalValue] = useState<FilterValue>(currentFilterValue || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced onChange handler
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced update
    debounceTimerRef.current = setTimeout(() => {
      if (localValue !== currentFilterValue) {
        onFilterChange?.(columnKey, localValue);
      }
    }, 500); // 500ms debounce

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, columnKey, currentFilterValue, onFilterChange]);

  // Sync external changes to local state
  useEffect(() => {
    if (currentFilterValue !== localValue) {
      setLocalValue(currentFilterValue || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterValue]);

  const handleChange = useCallback((value: FilterValue) => {
    setLocalValue(value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onFilterChange?.(columnKey, '');
  }, [columnKey, onFilterChange]);

  const renderFilterInput = () => {
    if (!filterConfig) return null;

    const { type, options = [], placeholder, isMulti = false } = filterConfig;

    switch (type) {
      case FilterType.TEXT:
        return (
          <TextField
            size='small'
            placeholder={placeholder || 'Filter...'}
            value={localValue as string}
            onChange={(e) => handleChange(e.target.value)}
            variant='outlined'
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 32,
                fontSize: 13,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                },
              },
              '& input': {
                color: '#000',
                '&::placeholder': {
                  color: 'rgba(0, 0, 0, 0.5)',
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              endAdornment: localValue ? (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={handleClear} edge='end' sx={{ p: 0 }}>
                    <Icon icon='mdi:close' fontSize={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        );

      case FilterType.DROPDOWN:
        return (
          <AppSelect
            id={`filter-${columnKey}`}
            value={
              localValue
                ? options.find(
                    (opt) => opt != null && (opt.id === localValue || opt.value === localValue),
                  ) || null
                : null
            }
            onChange={(selected: any) => handleChange(selected?.id || selected?.value || '')}
            options={options}
            placeholder={placeholder || 'Select...'}
            isClearable
            formControlProps={{
              sx: { minWidth: '100%' },
            }}
            menuPosition='fixed'
            customStyles={{
              control: (base: object, state: any) => ({
                ...base,
                minHeight: 32,
                fontSize: 13,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }),
              singleValue: (base: object) => ({
                ...base,
                color: '#000 !important',
                fontSize: 13,
              }),
              placeholder: (base: object) => ({
                ...base,
                color: 'rgba(0, 0, 0, 0.5)',
                fontSize: 13,
              }),
              input: (base: object) => ({
                ...base,
                color: '#000 !important',
                margin: 0,
                padding: 0,
              }),
              valueContainer: (base: object) => ({
                ...base,
                padding: '2px 8px',
              }),
              indicatorsContainer: (base: object) => ({
                ...base,
                '& svg': {
                  fill: '#000',
                },
              }),
              option: (base: object, state: any) => ({
                ...base,
                fontSize: 13,
                backgroundColor: state.isSelected
                  ? '#1976d2'
                  : state.isFocused
                    ? '#e3f2fd'
                    : 'white',
                color: state.isSelected ? 'white' : '#000',
                '&:hover': {
                  backgroundColor: state.isSelected ? '#1976d2' : '#e3f2fd',
                },
              }),
              menu: (base: object) => ({
                ...base,
                zIndex: 9999,
              }),
              menuPortal: (base: object) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
        );

      case FilterType.MULTI_SELECT: {
        const selectedValues = Array.isArray(localValue) ? localValue : [];
        return (
          <Select
            multiple
            size='small'
            value={selectedValues}
            onChange={(e) => handleChange(e.target.value as string[])}
            displayEmpty
            renderValue={(selected) => {
              if (!selected || selected.length === 0) {
                return (
                  <span style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.5)', fontStyle: 'normal' }}>
                    {placeholder || 'Select...'}
                  </span>
                );
              }
              return selected
                .map((val) => {
                  const option = options.find(
                    (opt) => opt != null && (opt.id === val || opt.value === val),
                  );
                  return option?.name || option?.label || val;
                })
                .join(', ');
            }}
            fullWidth
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              sx: {
                zIndex: 9999,
              },
            }}
            sx={{
              height: 32,
              fontSize: 13,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#000',
              '& .MuiSelect-select': {
                py: 0.5,
                textAlign: 'left',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.7)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <MenuItem disabled value=''>
              <span style={{ fontStyle: 'normal' }}>{placeholder || 'Select...'}</span>
            </MenuItem>
            {options
              .filter((opt) => opt != null)
              .map((option) => {
                const optionValue = (option.id || option.value || '') as string;
                return (
                  <MenuItem key={optionValue} value={optionValue} sx={{ fontSize: 13 }}>
                    <Checkbox checked={selectedValues.includes(optionValue)} size='small' />
                    <ListItemText
                      primary={option.name || option.label}
                      sx={{ '& span': { fontSize: 13 } }}
                    />
                  </MenuItem>
                );
              })}
          </Select>
        );
      }

      case FilterType.DATE_RANGE: {
        const dateRange = localValue as { from: Date | null; to: Date | null } | null;
        const startDate = dateRange?.from || null;
        const endDate = dateRange?.to || null;

        return (
          <AppDatePicker
            id={`filter-date-${columnKey}`}
            selected={null}
            showYearDropdown
            showMonthDropdown
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(dates: [Date | null, Date | null]) => {
              const [start, end] = dates;
              handleChange({ from: start, to: end });
            }}
            placeholderText={placeholder || 'Select range'}
            isClearable
            inputProps={{
              size: 'small',
              fullWidth: true,
              showIcon: false,
              sx: {
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  height: 32,
                  fontSize: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
                '& input': {
                  color: '#000',
                  '&::placeholder': {
                    color: 'rgba(0, 0, 0, 0.5)',
                    opacity: 1,
                  },
                },
              },
            }}
            wrapperProps={{
              sx: { width: '100%' },
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <TableCell component='th' sx={{ whiteSpace: 'nowrap', ...sx }} {...rest}>
      <Box>
        {/* Header Label */}
        <Box sx={{ textTransform: 'uppercase', mb: filterConfig ? 1 : 0, textAlign: 'left' }}>
          {typeof header === 'string' ? <Translations text={header} /> : header}
        </Box>

        {/* Filter Input */}
        {filterConfig && <Box sx={{ minWidth: 150 }}>{renderFilterInput()}</Box>}
      </Box>
    </TableCell>
  );
};
