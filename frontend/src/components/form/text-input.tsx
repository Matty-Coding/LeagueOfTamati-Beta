import type React from "react";
import type { JSX } from "react";
import capitalize from "../../utils/capitalize";
import FormErrorMessage from "./form-error-message";

type TextInputProps = {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  errorMessage?: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

export default function TextInput({
  id,
  name,
  value,
  placeholder,
  errorMessage,
  onChange,
  onBlur,
}: TextInputProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="form-label">
        {capitalize(name)}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className="form-input"
        required
        autoComplete="off"
        autoFocus={false}
        {...(id === "username" && { minLength: 3, maxLength: 20 })}
      />
      <FormErrorMessage message={errorMessage} />
    </div>
  );
}
