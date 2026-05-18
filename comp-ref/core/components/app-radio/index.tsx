import React, { forwardRef, memo } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { ClickableInfoTip } from '@/components/tool-tip';
import { AppRadioProps } from './types';

const labelStyle = { display: 'flex', alignItems: 'center', gap: 4 };

const AppRadio = forwardRef<HTMLDivElement, AppRadioProps>(
  (
    {
      value = '',
      row = true,
      radioProps,
      radioList,
      formLabelProps,
      radioGroupProps,
      onChange,
      id,
    },
    ref,
  ) => {
    const { slotProps = {} } = formLabelProps || {};
    const { typography } = slotProps;

    return (
      <RadioGroup
        row={row}
        aria-label='controlled'
        name='controlled'
        value={value}
        id={id}
        onChange={onChange}
        ref={ref}
        {...radioGroupProps}
      >
        {radioList?.map((radio) => (
          <FormControlLabel
            key={radio?.value}
            value={radio?.value}
            label={
              <span style={labelStyle}>
                {radio.label}
                {radio.infoContent && (
                  <ClickableInfoTip
                    iconButtonSxProps={{ padding: 0, margin: 0 }}
                    content={radio?.infoContent}
                  />
                )}
              </span>
            }
            control={<Radio {...radioProps} />}
            slotProps={{ typography: { fontSize: 14, ...typography }, ...slotProps }}
            {...formLabelProps}
          />
        ))}
      </RadioGroup>
    );
  },
);

AppRadio.displayName = 'AppRadio';

export default memo(AppRadio);
