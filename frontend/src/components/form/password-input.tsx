import { useState, type JSX } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import FormErrorMessage from "./form-error-message";

type PasswordInputProps = {
  labelText: string;
  id: string;
  name: string;
  value: string;
  errorMessage?: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

export default function PasswordInput({
  labelText,
  id,
  name,
  value,
  errorMessage,
  onChange,
  onBlur,
}: PasswordInputProps): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="form-label">
        {labelText}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          value={value}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          onChange={onChange}
          onBlur={onBlur}
          className="form-input"
          required
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className={`absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer text-lol-text/80 hover:text-lol-text ${!value ? "hidden" : ""}`}
        >
          {value && show ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </button>
      </div>
      <FormErrorMessage message={errorMessage} />
    </div>
  );
}
