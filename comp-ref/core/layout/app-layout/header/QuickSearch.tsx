import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import navItems from '@/constant/nav-items';
import { SettingsContext } from '@/context/SettingsContext';
import Icon from '@/core/components/icon';
import { NavGroup, NavLink } from '@/core/layout/types';
import { usePermission } from '@/hooks/use-permission';

type NavItem = NavGroup | NavLink;

type SearchOption = {
  title: string;
  path: string;
  parentTitle?: string;
  parentId?: number;
  itemId?: number;
};

const QuickSearch: React.FC = () => {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { setSelectedNavId } = useContext(SettingsContext);
  const { havePermission } = usePermission();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    const flattened: SearchOption[] = [];

    const processItem = (item: NavItem, parentTitle?: string, parentId?: number) => {
      if (item.permissionKey && !havePermission(item.permissionKey)) {
        return;
      }

      if (item.path) {
        flattened.push({
          title: item.title,
          path: item.path,
          parentTitle,
          parentId,
          itemId: item.id,
        });
      }

      if ('children' in item && item.children) {
        item.children.forEach((child) => processItem(child, item.title, item.id));
      }
    };

    navItems.forEach((item) => processItem(item));
    return flattened;
  }, [havePermission]);

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string | SearchOption | null) => {
      if (newValue && typeof newValue !== 'string') {
        // Set the selected nav item before navigation to ensure correct menu display
        // For items with children, use parentId. For top-level items without children, use itemId
        const navIdToSelect = newValue.parentId || newValue.itemId;
        if (navIdToSelect) {
          setSelectedNavId(navIdToSelect);
        }
        push(newValue.path);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
      setInputValue('');
    },
    [push, setSelectedNavId],
  );

  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, newInputValue: string, reason: string) => {
      if (reason === 'reset') {
        setInputValue('');
        return;
      }
      setInputValue(newInputValue);
    },
    [],
  );

  const handleFilterOptions = useCallback(
    (options: SearchOption[], state: { inputValue: string }) => {
      const searchValue = state.inputValue.trim().toLowerCase();
      return options.filter((option) => {
        const title = t(option.title).toLowerCase();
        const parent = option.parentTitle ? t(option.parentTitle).toLowerCase() : '';
        return title.includes(searchValue) || parent.includes(searchValue);
      });
    },
    [t],
  );

  // Keyboard shortcut: Cmd+E (Mac) or Ctrl+E (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+E (Mac) or Ctrl+E (Windows/Linux)
      // Use both key checks to handle different keyboard layouts
      const isTargetKey = event.key.toLowerCase() === 'e' || event.code === 'KeyE';
      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (isModifierPressed && isTargetKey && !event.shiftKey && !event.altKey) {
        console.log('Quick search keyboard shortcut triggered');

        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();

        // Focus the search input using ref
        if (inputRef.current) {
          console.log('Focusing search input');
          inputRef.current.focus();
          inputRef.current.select(); // Also select any existing text
        } else {
          console.warn('Quick search input ref not available');
        }
      }
    };

    // Use capture phase to catch the event early
    window.addEventListener('keydown', handleKeyDown, true);
    console.log('Quick search keyboard shortcut listener registered');

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return (
    <Box sx={{ width: { md: 200, lg: 250 }, mr: 1, display: { xs: 'none', md: 'block' } }}>
      <Autocomplete
        id='quick-search'
        freeSolo
        disableClearable
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : t(option.title))}
        filterOptions={handleFilterOptions}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        renderOption={({ key, ...props }, option, { index }) => (
          <Box
            component='li'
            {...props}
            key={`${key}-${option.title}`}
            sx={{
              position: 'relative',
              py: 1.5,
              borderTop: index > 0 ? (theme) => `1px solid ${theme.palette.divider}` : 'none',
            }}
          >
            <Typography variant='body2' sx={{ width: '100%' }}>
              {option.parentTitle && (
                <Typography component='span' variant='body2' color='text.secondary'>
                  {t(option.parentTitle)}{' '}
                </Typography>
              )}
              <Typography component='span' variant='body2' color='text.primary'>
                {t(option.title)}
              </Typography>
            </Typography>
          </Box>
        )}
        renderInput={(params) => (
          <OutlinedInput
            {...params.InputProps}
            inputProps={params.inputProps}
            inputRef={inputRef}
            fullWidth
            size='small'
            placeholder={t('common.search')}
            startAdornment={
              <InputAdornment position='start'>
                <Icon fontSize={18} icon='iconamoon:search-light' />
              </InputAdornment>
            }
            sx={{
              height: 36,
              fontSize: 13,
              '& input::placeholder': {
                fontSize: 13,
              },
              '& .MuiInputAdornment-root': {
                marginRight: 0,
              },
            }}
          />
        )}
      />
    </Box>
  );
};

export default memo(QuickSearch);
