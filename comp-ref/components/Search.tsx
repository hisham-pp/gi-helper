'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTranslation } from 'react-i18next';
import Icon from '@/core/components/icon';
import useDebounce from '@/hooks/use-debounce';

export type SearchSize = 'small' | 'medium';

export type SearchProps = {
  value?: string;
  size?: SearchSize;
  onChange?: (newQuery: string) => void;
};

const sizeConfig = {
  small: { height: 32, fontSize: 12, iconSize: 14 },
  medium: { height: 40, fontSize: 14, iconSize: 18 },
};

const Search: React.FC<SearchProps> = ({ value = '', size = 'small', onChange }) => {
  const { t } = useTranslation();
  const [innerQuery, setInnerQuery] = useState('');

  const debounce = useDebounce((value) => onChange && onChange(value), 500);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;

      setInnerQuery(newQuery);
      debounce(newQuery);
    },
    [setInnerQuery, debounce],
  );

  useEffect(() => {
    setInnerQuery(value);

    //FIX:ME
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const config = sizeConfig[size];

  return (
    <OutlinedInput
      fullWidth
      size='small'
      placeholder={t('common.search')}
      value={innerQuery}
      onChange={handleChange}
      startAdornment={
        <InputAdornment position='start'>
          <Icon fontSize={config.iconSize} icon='iconamoon:search-light' />
        </InputAdornment>
      }
      sx={{
        height: config.height,
        fontSize: config.fontSize,
        '& input': {
          fontSize: config.fontSize,
          py: 0.5,
        },
        '& input::placeholder': {
          fontSize: config.fontSize,
        },
      }}
    />
  );
};

export default memo(Search);
