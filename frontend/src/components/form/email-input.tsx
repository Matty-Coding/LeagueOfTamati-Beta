import type { JSX } from "react";
import capitalize from "../../utils/capitalize";
import FormErrorMessage from "./form-error-message";

type EmailInputProps = {
  id: string;
  name: string;
  value: string;
  errorMessage?: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

export default function EmailInput({
  id,
  name,
  value,
  errorMessage,
  onChange,
  onBlur,
}: EmailInputProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="form-label">
        {capitalize(name)}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        type="email"
        placeholder="username@example.com"
        onChange={onChange}
        onBlur={onBlur}
        className="form-input"
        required
        autoComplete="off"
      />
      <FormErrorMessage message={errorMessage} />
    </div>
  );
}
