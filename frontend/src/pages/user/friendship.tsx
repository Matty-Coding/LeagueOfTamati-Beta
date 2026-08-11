import { useState, useMemo } from "react";
import { useFriendlist } from "../../hooks/friendship";
import { searchUsers } from "../../services/search";
import type { UserSearchResult } from "../../types/friendship";

export default function FriendsPage() {
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setSearching(true);
      setResults(await searchUsers(query));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <p>Caricamento lista amici...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-2">Cerca utenti</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username"
            className="border rounded px-2 py-1 flex-1"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Cerca
          </button>
        </form>
        {searching && <p>Ricerca in corso...</p>}
        <ul className="mt-2 space-y-1">
          {results.map((user) => (
            <li key={user.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-6 h-6 rounded-full"
                />
                {user.username}
              </span>
              <button
                onClick={() => sendRequest(user.id)}
                className="text-sm text-blue-600"
              >
                Aggiungi
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Richieste ricevute</h2>
        {incoming.length === 0 && (
          <p className="text-gray-500">Nessuna richiesta in sospeso</p>
        )}
        <ul className="space-y-1">
          {incoming.map((f) => (
            <li
              key={f.friendship_id}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <img
                  src={f.friend.avatar}
                  alt={f.friend.username}
                  className="w-6 h-6 rounded-full"
                />
                {f.friend.username}
              </span>
              <span className="flex gap-2">
                <button
                  onClick={() => respondToRequest(f.friendship_id, "accepted")}
                  className="text-green-600 text-sm"
                >
                  Accetta
                </button>
                <button
                  onClick={() => respondToRequest(f.friendship_id, "rejected")}
                  className="text-red-600 text-sm"
                >
                  Rifiuta
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Richieste inviate</h2>
        {outgoing.length === 0 && (
          <p className="text-gray-500">Nessuna richiesta inviata</p>
        )}
        <ul className="space-y-1">
          {outgoing.map((f) => (
            <li
              key={f.friendship_id}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <img
                  src={f.friend.avatar}
                  alt={f.friend.username}
                  className="w-6 h-6 rounded-full"
                />
                {f.friend.username}
              </span>
              <button
                onClick={() => removeFriendship(f.friendship_id)}
                className="text-sm text-gray-500"
              >
                Annulla
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Amici</h2>
        {accepted.length === 0 && (
          <p className="text-gray-500">Nessun amico ancora</p>
        )}
        <ul className="space-y-1">
          {accepted.map((f) => (
            <li
              key={f.friendship_id}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <img
                  src={f.friend.avatar}
                  alt={f.friend.username}
                  className="w-6 h-6 rounded-full"
                />
                {f.friend.username}
              </span>
              <button
                onClick={() => removeFriendship(f.friendship_id)}
                className="text-sm text-red-500"
              >
                Rimuovi
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
