import { useState, type JSX } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export function HamburgerMenu({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <>
      <HiOutlineMenu
        className="md:hidden text-4xl cursor-pointer"
        onClick={handleToggle}
      />
      <div
        // bubbling event delegation
        onClick={handleClose}
        className={`${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"} fixed top-0 right-0 size-full bg-lol-bg py-2 px-3 transform transition-all duration-200 ease-in-out z-20`}
      >
        <div className="flex items-center justify-between relative border-b-2 border-b-lol-text pb-2">
          <h2 className="text-2xl font-bold text-lol-gold font-cinzel grow text-center">
            League of Tamati
          </h2>
          <HiOutlineX
            className="text-lol-text opacity-80 cursor-pointer hover:opacity-100 hover:text-red-600 transition-opacity duration-300 ease-in-out"
            size={22}
            onClick={(event) => {
              // handling bubbling on close icon
              event.stopPropagation();
              handleClose();
            }}
          />
        </div>

        {/* content */}
        <div className="flex flex-col gap-3 text-lg mt-3">{children}</div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-10 md:hidden transition-all duration-300"></div>
      )}
    </>
  );
}
