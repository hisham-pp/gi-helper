import {
  CountryData as ReactCountryData,
  PhoneInputProps as ReactPhoneInputProps,
} from 'react-phone-input-2';

type PhoneInputProps = ReactPhoneInputProps & {
  helperText?: string;
  markAsRequired?: boolean;
  disabled?: boolean;
  id?: string;
};

export default PhoneInputProps;

export type CountryData = ReactCountryData;
