import type { JSX } from "react";
import { MdMenuBook } from "react-icons/md";
import { RiBook2Fill } from "react-icons/ri";

interface DropdownButtonProps {
  isExpanded: boolean;
  handleClick: () => void;
}

export function DropdownButton({
  isExpanded,
  handleClick,
}: DropdownButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={handleClick}
      className="border rounded-md border-emerald-500 px-3 py-1 text-emerald-500 font-bold xl:hidden flex items-center gap-1"
    >
      {isExpanded ? (
        <>
          Read less <MdMenuBook />
        </>
      ) : (
        <>
          Read more <RiBook2Fill />
        </>
      )}
    </button>
  );
}
