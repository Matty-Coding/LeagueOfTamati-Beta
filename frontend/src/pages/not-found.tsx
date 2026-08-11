import type { JSX } from "react";
import { Link } from "react-router";

export function NotFoundPage(): JSX.Element {
  return (
    <div>
      <h1>Page Not Found</h1>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
