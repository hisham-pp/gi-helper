import React, { DetailedHTMLProps, InputHTMLAttributes, useRef } from 'react';
import Icon from '../icon';
import { ColorPickerButton, ColorPickerWrapper } from './styled-components';

type AppColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
};

const AppColorPicker: React.FC<AppColorPickerProps> = ({ value, onChange, inputProps }) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const { style, ...inputPropsRest } = inputProps ?? {};

  const handleColorIconClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <ColorPickerWrapper>
      <ColorPickerButton bgColor={value} onClick={handleColorIconClick}>
        <Icon icon='formkit:color' />
      </ColorPickerButton>
      <input
        type='color'
        ref={colorInputRef}
        value={value}
        onChange={handleColorChange}
        style={{
          position: 'absolute',
          top: '100%',
          insetInlineStart: 0,
          zIndex: 10,
          marginTop: '5px',
          width: 'auto',
          opacity: 0,
          ...style,
        }}
        {...inputPropsRest}
      />
    </ColorPickerWrapper>
  );
};

export default AppColorPicker;
