import type { JSX } from "react";
import { NavLink } from "react-router";

interface NavBarLinkProps {
  to: string;
  label: string;
  icon: JSX.Element;
}

export function NavBarLink({ to, label, icon }: NavBarLinkProps): JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-1 font-semibold flex items-center gap-2 transition-colors duration-200 ${
          isActive ? "text-lol-gold" : "hover:text-lol-gold"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span>{label}</span>
          {icon}
          {isActive && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-lol-gold to-transparent" />
          )}
        </>
      )}
    </NavLink>
  );
}
