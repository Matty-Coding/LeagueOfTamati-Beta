import { Link, NavLink, useNavigate } from "react-router";
import Logo from "./logo";
import { useAuth } from "../hooks/auth";
import { logoutRequest } from "../services/auth";
import { useState, type JSX } from "react";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { HamburgerMenu } from "./hamburger-menu";
import { MdLeaderboard } from "react-icons/md";
import { HiBookOpen } from "react-icons/hi";
import { IoGameController } from "react-icons/io5";
import { NavBarLink } from "./navbar-links";
import { IoMdPerson } from "react-icons/io";

export default function NavBar(): JSX.Element {
  const { isAuthenticated, logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await logoutRequest();
      logout();
      toast.success(response.message);
      navigate("/login");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        navigate("/", {
          state: {
            message: error.response?.data?.detail,
          },
        });
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="flex justify-between items-center py-2 px-5 lg:px-10 sticky top-0 z-100 bg-lol-bg">
      <Logo />

      {/* desktop */}
      <div className="hidden md:flex items-center gap-2 text-lg">
        <NavBarLink to="/wiki" label="Wiki" icon={<HiBookOpen />} />
        <NavBarLink
          to="/game/extreme"
          label="Game"
          icon={<IoGameController />}
        />
        <NavBarLink
          to="/leaderboard"
          label="Leaderboard"
          icon={<MdLeaderboard />}
        />
      </div>

      {isAuthenticated ? (
        // user profile container
        <div
          className="hidden md:flex flex-col relative cursor-pointer"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* avatar + username button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex py-1 px-2 gap-3 items-center w-full text-left bg-transparent border-none cursor-pointer focus:outline-none"
          >
            <span className="shrink-0 w-10 h-10 rounded-full ring-2 ring-lol-gold">
              <img
                src={user?.avatar}
                alt="avatar"
                className="size-full object-cover rounded-full"
              />
            </span>
            <p className="hidden md:block grow">{user?.username}</p>
          </button>

          {/* dropdown container */}
          <div
            className={`${
              isOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-2 pointer-events-none"
            } absolute top-full right-0 pt-2 z-50 w-32 transition-all duration-200 ease-in-out`}
          >
            {/* dropdown content */}
            <div className="bg-lol-bg border border-lol-gold rounded-lg py-1 px-2 shadow-lg">
              {/* profile */}
              <Link
                to={`/profile/${user?.username}`}
                onClick={() => setIsOpen(false)}
                className="flex justify-center cursor-pointer w-full rounded-md py-1 px-3 items-center gap-1 text-base hover:bg-lol-gold/50"
              >
                Profile
                <IoMdPerson />
              </Link>

              {/* logout */}
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex justify-center text-red-700 cursor-pointer hover:bg-red-700 hover:text-lol-bg w-full rounded-md py-1 px-3 items-center gap-1 text-base mt-1"
              >
                Logout <FiLogOut />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Link
          to="/login"
          className="hidden md:flex btn rounded-md py-1 px-3 items-center gap-1 text-base"
        >
          Login <FiLogIn />
        </Link>
      )}

      {/* mobile */}
      <div className="md:hidden">
        <HamburgerMenu>
          <>
            <NavLink
              to="/wiki"
              className={({ isActive }) =>
                `py-1 font-semibold flex items-center justify-center w-2/3 mx-auto rounded-lg gap-2 transition-colors duration-200 ${
                  isActive ? "bg-lol-gold/70 text-lol-bg" : ""
                }`
              }
            >
              Wiki <HiBookOpen />
            </NavLink>
            <NavLink
              to="/game/extreme"
              className={({ isActive }) =>
                `py-1 font-semibold flex items-center justify-center w-2/3 mx-auto rounded-lg gap-2 transition-colors duration-200 ${
                  isActive ? "bg-lol-gold/70 text-lol-bg" : ""
                }`
              }
            >
              Game <IoGameController />
            </NavLink>
            <NavLink
              to={`/profile/${user?.username}`}
              className={({ isActive }) =>
                `py-1 font-semibold flex items-center justify-center w-2/3 mx-auto rounded-lg gap-2 transition-colors duration-200 ${
                  isActive ? "bg-lol-gold/70 text-lol-bg" : ""
                }`
              }
            >
              Profile <IoMdPerson />
            </NavLink>

            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `py-1 font-semibold flex items-center justify-center w-2/3 mx-auto rounded-lg gap-2 transition-colors duration-200 ${
                  isActive ? "bg-lol-gold/70 text-lol-bg" : ""
                }`
              }
            >
              Leaderboard <MdLeaderboard />
            </NavLink>

            {isAuthenticated ? (
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex justify-center text-red-700 cursor-pointer hover:bg-red-700 hover:text-lol-bg w-full rounded-md py-1 px-3 items-center gap-1 text-base mt-1"
              >
                Logout <FiLogOut />
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `py-1 font-semibold flex items-center justify-center w-2/3 mx-auto rounded-lg gap-2 transition-colors duration-200 ${
                    isActive ? "bg-lol-gold/70 text-lol-bg" : ""
                  }`
                }
              >
                Login <FiLogIn />
              </NavLink>
            )}
          </>
        </HamburgerMenu>
      </div>
    </nav>
  );
}
