import type { JSX } from "react";
import logo from "../assets/league-of-tamati.png";
import { Link } from "react-router";

export default function Logo(): JSX.Element {
  return (
    <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 cursor-pointer">
      <Link to="/">
        <img src={logo} alt="logo" />
      </Link>
    </div>
  );
}
