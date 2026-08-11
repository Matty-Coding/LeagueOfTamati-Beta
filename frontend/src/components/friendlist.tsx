import { useState, useMemo, useEffect } from "react";
import { useFriendlist } from "../hooks/friendship";
import type { UserSearchResult } from "../types/friendship";
import { searchUsers } from "../services/search";
import Spinner from "./spinner";
import { FaUserMinus, FaUserPlus } from "react-icons/fa6";
import { RiCheckFill, RiCloseFill } from "react-icons/ri";
import { HiOutlineChevronDown } from "react-icons/hi";
import { Link } from "react-router";

export function Friendlist() {
  const {
    friendships,
    loading,
    error,
    sendRequest,
    respondToRequest,
    removeFriendship,
  } = useFriendlist();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);

  const accepted = useMemo(
    () => friendships.filter((f) => f.status === "accepted"),
    [friendships],
  );
  const incoming = useMemo(
    () => friendships.filter((f) => f.status === "pending" && !f.is_requester),
    [friendships],
  );
  const outgoing = useMemo(
    () => friendships.filter((f) => f.status === "pending" && f.is_requester),
    [friendships],
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timerId = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await searchUsers(trimmedQuery);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-lol-blue border-3 border-lol-blue-light rounded-md p-4 space-y-4">
      {/* Search Section */}
      <section className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Username"
          className="w-full bg-lol-card/80 text-lol-text rounded-lg pl-2 pr-8 py-2 border border-lol-blue-light/60 focus:border-lol-gold focus:outline-none focus:ring-1 focus:ring-lol-gold transition-all ring ring-lol-text-muted"
        />
        {searching && (
          <div className="absolute right-3 top-2.5">
            <Spinner />
          </div>
        )}

        {/* Search Results only if there are any */}
        {results.length > 0 && (
          <ul className="absolute top-full mt-1 z-50 bg-lol-bg w-full border border-lol-text-muted rounded-lg overflow-hidden shadow-lg max-h-32">
            {results.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between p-2 hover:bg-lol-card/50 border-b border-b-lol-text-muted/30 last:border-none"
              >
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={() => sendRequest(user.id)}
                  className="flex gap-1 items-center text-sm text-lol-text hover:text-green-500 cursor-pointer transition-colors"
                >
                  Add <FaUserPlus />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Friend Requests Section */}
      <section className="relative">
        <button
          type="button"
          onClick={() => setRequestsOpen((prev) => !prev)}
          className="flex items-center justify-between w-full cursor-pointer py-1"
        >
          <h2 className="font-semibold">
            Friend requests ({incoming.length + outgoing.length})
          </h2>
          <HiOutlineChevronDown
            className={`transition-transform duration-200 ${
              requestsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {requestsOpen && (
          <div className="mt-2 space-y-4 pt-2 border-t border-lol-blue-light/40">
            {/* Incoming */}
            <div>
              {incoming.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No requests received
                </p>
              ) : (
                <ul className="space-y-2">
                  {incoming.map((f) => (
                    <li
                      key={f.friendship_id}
                      className="flex items-center justify-between border border-lol-text-muted p-2 rounded-lg"
                    >
                      <Link
                        to={`/profile/${f.friend.username}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <img
                          src={f.friend.avatar}
                          alt={f.friend.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{f.friend.username}</span>
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            respondToRequest(f.friendship_id, "accepted")
                          }
                          className="p-1 hover:text-green-500 cursor-pointer transition-colors"
                          title="Accept"
                        >
                          <RiCheckFill size={18} />
                        </button>
                        <button
                          onClick={() =>
                            respondToRequest(f.friendship_id, "rejected")
                          }
                          className="p-1 hover:text-red-500 cursor-pointer transition-colors"
                          title="Reject"
                        >
                          <RiCloseFill size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Outgoing (Only if there are any) */}
            {outgoing.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-lol-text-muted mb-2">
                  Sent
                </h3>
                <div className="flex flex-wrap gap-2">
                  {outgoing.map((f) => (
                    <div
                      key={f.friendship_id}
                      className="flex items-center gap-2 bg-lol-card/60 border border-lol-blue-light/50 px-2.5 py-1 rounded-full text-xs"
                    >
                      <Link
                        to={`/profile/${f.friend.username}`}
                        className="hover:underline font-medium"
                      >
                        {f.friend.username}
                      </Link>
                      <button
                        onClick={() => removeFriendship(f.friendship_id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                        title="Annulla richiesta"
                      >
                        <RiCloseFill size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Friends List Section */}
      <section className="pt-2 border-t border-lol-blue-light/40">
        <h2 className="font-semibold mb-2">Friends ({accepted.length})</h2>
        {accepted.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No friends</p>
        ) : (
          <ul className="space-y-2">
            {accepted.map((f) => (
              <li
                key={f.friendship_id}
                className="flex items-center justify-between"
              >
                <Link
                  to={`/profile/${f.friend.username}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <img
                    src={f.friend.avatar}
                    alt={f.friend.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{f.friend.username}</span>
                </Link>
                <button
                  onClick={() => removeFriendship(f.friendship_id)}
                  className="text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                >
                  Remove <FaUserMinus />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
