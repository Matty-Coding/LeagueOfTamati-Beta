import { useEffect, useState, type JSX } from "react";
import { HiSearch } from "react-icons/hi";
import { useChampions } from "../hooks/champions";
import Spinner from "./spinner";
import { RiCloseCircleLine } from "react-icons/ri";
import { useAuth } from "../hooks/auth";
import type { UpdateUserProfile } from "../types/user";
import { updateUser } from "../services/user";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedProfile: UpdateUserProfile) => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSuccess,
}: ProfileEditModalProps): JSX.Element {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { data, loading } = useChampions();
  const [activeFilter, setActiveFilter] = useState<"avatar" | "background">(
    "avatar",
  );
  const [textFilter, setTextFilter] = useState<string>("");
  const { user, isLoading } = useAuth();
  const [isUpdateLoading, setIsUpdateLoading] = useState<boolean>(false);
  const [currentCustomization, setCurrentCustomization] =
    useState<UpdateUserProfile>({
      avatar: user?.avatar ?? "",
      background: user?.background ?? "",
    });

  useEffect(() => {
    if (isLoading) return;
    const update = async () => {
      setCurrentCustomization({
        avatar: user?.avatar ?? "",
        background: user?.background ?? "",
      });
    };
    update();
  }, [user, isOpen, isLoading]);

  const filteredChampions =
    data?.filter((champion) => {
      const cleanText: string = textFilter.trim().toLowerCase();
      const matchesText: boolean = champion.name
        .toLowerCase()
        .includes(cleanText);

      return matchesText;
    }) ?? [];

  const onConfirm = async () => {
    try {
      setIsUpdateLoading(true);
      const response = await updateUser(currentCustomization);
      setCurrentCustomization({
        avatar: response.avatar,
        background: response.background,
      });

      if (onSuccess) {
        onSuccess({
          avatar: response.avatar,
          background: response.background,
        });
      }
    } catch (error) {
      console.error(error);
    }
    setIsUpdateLoading(false);
    onClose();
    setTextFilter("");
    setActiveFilter("avatar");
  };

  if (!isOpen) return <></>;

  const isAvatar = activeFilter === "avatar";
  const currentAvatar = currentCustomization.avatar;
  const currentBackground = currentCustomization.background;

  return (
    // backdrop
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-lol-bg/50 backdrop-blur-md">
      {/* container */}
      <div className="relative flex flex-col w-[90vw] h-[90vh] bg-lol-blue rounded-xl border-3 border-lol-blue-light animate-fade">
        {/* header */}
        <header className="flex items-center justify-between gap-2 p-3 border-b border-lol-text-muted">
          {/* search */}
          <div className="relative grow">
            <HiSearch
              className="absolute left-2 top-1/2 -translate-y-1/2 text-lol-text-muted"
              size={20}
            />
            <input
              type="search"
              placeholder="Search"
              className="w-full bg-lol-card/80 text-lol-text rounded-lg pl-8 pr-7 py-2 border border-lol-blue-light/60 focus:border-lol-gold focus:outline-none focus:ring-1 focus:ring-lol-gold transition-all ring ring-lol-text-muted"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
            />
            {textFilter && (
              <RiCloseCircleLine
                className="absolute right-1 top-1/2 -translate-y-1/2 text-red-400 opacity-80 cursor-pointer hover:opacity-100"
                size={20}
                onClick={() => setTextFilter("")}
              />
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              className={`transition-colors duration-200 ease-in-out cursor-pointer border border-lol-gold py-2 px-4 rounded-md ${isAvatar ? "bg-lol-gold text-lol-bg" : "hover:text-lol-gold"}`}
              onClick={() => setActiveFilter("avatar")}
            >
              Avatar
            </button>
            <button
              className={`transition-colors duration-200 ease-in-out cursor-pointer border border-lol-gold py-2 px-4 rounded-md ${!isAvatar ? "bg-lol-gold text-lol-bg" : "hover:text-lol-gold"}`}
              onClick={() => setActiveFilter("background")}
            >
              Splash
            </button>
          </div>
        </header>

        {/* main content */}
        <main className="flex-1 overflow-y-auto">
          {loading && <Spinner />}

          {isAvatar && (
            <div className="flex flex-wrap gap-5 p-4 justify-evenly">
              {filteredChampions.map((champion) => (
                <div
                  key={champion.id}
                  className={`w-20 h-20 md:w-28 md:h-28 xl:w-36 xl:h-36 rounded-full ring-2 ${currentAvatar === champion.imageUrl ? "ring-lol-gold" : "ring-transparent"}`}
                  onClick={() =>
                    setCurrentCustomization({
                      ...currentCustomization,
                      avatar: champion.imageUrl,
                    })
                  }
                >
                  <img
                    src={champion.imageUrl}
                    alt={champion.name}
                    className="object-cover size-full object-center rounded-full"
                  />
                </div>
              ))}
            </div>
          )}

          {!isAvatar && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-4 gap-3">
              {filteredChampions.map((champion) =>
                champion.skins.map((skin) => (
                  <div
                    key={`${champion.id}-${skin.name}`}
                    className={`aspect-video rounded-md ring-2 ${currentBackground === skin.imageUrl ? "ring-lol-gold" : "ring-transparent"}`}
                    onClick={() =>
                      setCurrentCustomization({
                        ...currentCustomization,
                        background: skin.imageUrl,
                      })
                    }
                  >
                    <img
                      src={skin.imageUrl}
                      alt={skin.name}
                      loading="lazy"
                      className="object-cover size-full object-center rounded-md"
                    />
                  </div>
                )),
              )}
            </div>
          )}
        </main>

        {/* footer buttons */}
        <footer className="flex items-center justify-end gap-3 p-4 border-t border-t-lol-text-muted">
          <button
            onClick={onClose}
            className="text-rose-700 py-2 px-4 rounded-md cursor-pointer hover:text-rose-500 transition-colors duration-200 ease-in-out w-full md:w-auto md:px-6"
          >
            Cancel
          </button>
          <button
            className={`btn py-2 px-4 rounded-md w-full md:w-auto md:px-6 ${isUpdateLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer opacity-100"}`}
            onClick={onConfirm}
            disabled={isUpdateLoading}
          >
            {isUpdateLoading ? <Spinner /> : "Confirm"}
          </button>
        </footer>
      </div>
    </div>
  );
}
