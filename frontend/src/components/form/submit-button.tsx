import type { JSX } from "react";
import Spinner from "../spinner";

type SubmitButtonProps = {
  disabled: boolean;
  text: string;
  isSubmitting: boolean;
};

export default function SubmitButton({
  disabled,
  text,
  isSubmitting,
}: SubmitButtonProps): JSX.Element {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${disabled ? "cursor-not-allowed opacity-50 bg-emerald-500/30" : "opacity-100 btn glow"} w-full mx-5 py-2 rounded-md font-bold`}
    >
      {isSubmitting ? <Spinner /> : text}
    </button>
  );
}
