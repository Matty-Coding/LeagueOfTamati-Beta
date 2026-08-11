import { useEffect, useState, type JSX } from "react";
import { Footer } from "../../components/footer";
import NavBar from "../../components/navbar";
import { useAuth } from "../../hooks/auth";
import { useParams } from "react-router";
import { getOtherUserData, getUserData } from "../../services/user";
import type { OtherUser, UpdateUserProfile } from "../../types/user";
import type { User } from "../../types/auth";
import { FriendshipSpan } from "../../components/friendship-span";
import SpinnerPage from "../../utils/spinner-page";
import { FaUserPen } from "react-icons/fa6";
import type { FriendshipStatusToDisplay } from "../../types/friendship";
import { ProfileEditModal } from "../../components/profile-edit-modal";
import { Friendlist } from "../../components/friendlist";
import { RecordGame } from "../../components/record-game";

export function ProfilePage(): JSX.Element {
  const { user: currentUser, isLoading, refreshUser } = useAuth();
  const { username } = useParams<{ username: string }>();

  const [user, setUser] = useState<User | OtherUser | null>(null);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = username === currentUser?.username;

  useEffect(() => {
    if (isLoading) return;

    const loadUser = async () => {
      setIsLoadingData(true);

      try {
        if (isOwnProfile) {
          const data = await getUserData();
          setUser(data);
        } else {
          const data = await getOtherUserData(username!);
          setUser(data);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoadingData(false);
      }
    };
    loadUser();
  }, [isOwnProfile, username, isLoading]);

  const handleFriendshipChange = (newStatus: FriendshipStatusToDisplay) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        friendship_status: newStatus,
      } as OtherUser;
    });
  };

  const handleUpdateProfile = ({ avatar, background }: UpdateUserProfile) => {
    refreshUser({ avatar, background });
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        avatar: avatar,
        background: background,
      } as User;
    });
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading || isLoadingData) return <SpinnerPage />;

  if (error) return <p>{error}</p>;

  return (
    <div className="relative flex flex-col min-h-dvh">
      <NavBar />

      {/* hero section */}
      <div className="relative w-full aspect-video xl:h-[90vh]">
        <img
          src={user?.background}
          alt="background image"
          className="absolute inset-0 size-full object-cover object-top"
        />

        {/* gradient to background */}
        <div className="absolute inset-0 bg-linear-to-t from-lol-bg via-transparent"></div>

        {/* gradient to read the text (DESKTOP) */}
        <div className="hidden xl:block absolute inset-0 bg-linear-to-tr from-lol-bg from-20% via-transparent to-lol-bg"></div>

        <div className="absolute z-50 bottom-10 w-full flex items-center justify-between px-4 xl:px-10">
          {/* on the image (DESKTOP) */}
          <div className="hidden xl:flex items-center justify-center gap-5">
            {/* avatar */}
            <div className="w-24 h-24 rounded-full ring-2 ring-lol-gold z-10">
              <img
                src={user?.avatar}
                alt="avatar iamge"
                className="size-full object-cover rounded-full"
              />
            </div>

            <h1 className="text-lol-text font-bold text-7xl">
              {user?.username}
            </h1>
          </div>

          {/* friendship banner */}
          {!isOwnProfile && user && (
            <FriendshipSpan
              targetUserId={user.id}
              status={(user as OtherUser).friendship_status}
              onStatusChange={handleFriendshipChange}
            />
          )}

          {/* edit banner */}
          {isOwnProfile && user && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="friendship-span hover:bg-lol-text-muted/80 hover:text-lol-bg transition-color duration-200 ease-in"
            >
              Edit <FaUserPen />
            </button>
          )}
        </div>
      </div>
      {/* mobile */}
      <div className="xl:hidden flex justify-center items-center gap-5">
        {/* avatar */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full ring-2 ring-lol-gold z-10">
          <img
            src={user?.avatar}
            alt="avatar iamge"
            className="size-full object-cover rounded-full"
          />
        </div>

        <h1 className="font-bold text-3xl text-lol-text">{user?.username}</h1>
      </div>

      {isOwnProfile && user && (
        <div className="mt-5 w-[95vw] flex flex-col md:grid md:grid-cols-2 gap-5 mx-auto">
          {/* record mods */}
          <RecordGame
            name="Extreme Game"
            record={user?.extreme_game_record || 0}
            rank={user?.current_rank || 0}
          />

          {/* friendlist */}
          <Friendlist />
        </div>
      )}

      {!isOwnProfile && user && (
        <div className="mt-5 w-1/2 mx-auto h-50">
          <RecordGame
            name="Extreme Game"
            record={user?.extreme_game_record || 0}
            rank={user?.current_rank || 0}
          />
        </div>
      )}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleUpdateProfile}
      />
      <Footer />
    </div>
  );
}
