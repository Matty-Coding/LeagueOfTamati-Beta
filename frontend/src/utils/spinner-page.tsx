import type { JSX } from "react";
import Spinner from "../components/spinner";

export default function SpinnerPage(): JSX.Element {
  return (
    <div className="flex-center min-h-screen">
      <Spinner />
    </div>
  );
}
