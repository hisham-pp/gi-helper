import React from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import { useTranslation } from 'react-i18next';
import ReactPhoneInput from 'react-phone-input-2';
import useAuth from '@/hooks/use-auth';
import { getAlpha2Code } from '@/utils/phone-utils';
import { PhoneInputWrapper } from './styled-components';
import PhoneInputProps from './type';
import 'react-phone-input-2/lib/style.css';
import 'react-phone-input-2/lib/material.css';

const AppPhoneInput: React.FC<PhoneInputProps> = ({
  helperText,
  inputStyle,
  markAsRequired,
  country,
  disabled = false,
  specialLabel,
  id,
  ...rest
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const companyAlpha2 = user?.company?.country?.code?.toLowerCase() || '';
  const alpha2Code = country ? getAlpha2Code(country) : companyAlpha2;
  const hasError = rest.isValid === false || !!helperText;
  const wrapperClassName = `${markAsRequired ? 'label' : ''} ${hasError ? 'error' : ''}`.trim();

  return (
    <PhoneInputWrapper className={wrapperClassName}>
      <ReactPhoneInput
        specialLabel={t(specialLabel || '')}
        inputStyle={{ width: '100%', ...inputStyle }}
        country={alpha2Code}
        disabled={disabled}
        inputProps={{
          id,
          ...(rest.inputProps || {}),
        }}
        {...rest}
      />
      {helperText && <FormHelperText className='helper-text'>{helperText}</FormHelperText>}
    </PhoneInputWrapper>
  );
};
export default AppPhoneInput;
