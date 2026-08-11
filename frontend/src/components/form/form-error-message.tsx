import type { JSX } from "react";

type FormErrorMessageProps = {
  message?: string | null;
};

export default function FormErrorMessage({
  message,
}: FormErrorMessageProps): JSX.Element {
  return (
    <small
      className={`text-xs md:text-sm text-center border-l-red-300 border-l-2 p-1 bg-[#340407] text-red-300 opacity-0 transition-opacity duration-100 ease-in-out ${message ? "opacity-100" : "hidden"}`}
    >
      {message}
    </small>
  );
}
