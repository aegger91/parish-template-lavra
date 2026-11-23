import { useState, type ChangeEvent } from 'react';
import { maskPhone } from '../i18n/utils';

interface Props {
  id: string;
  name?: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
}

export default function PhoneInput({
  id,
  name = 'phone',
  label,
  required = false,
  defaultValue = '',
}: Props) {
  const [value, setValue] = useState(maskPhone(defaultValue));

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(maskPhone(e.target.value));
  }

  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="(000)-000-0000"
        value={value}
        onChange={onChange}
        required={required}
        pattern="\(\d{3}\)-\d{3}-\d{4}"
        maxLength={14}
      />
    </div>
  );
}
