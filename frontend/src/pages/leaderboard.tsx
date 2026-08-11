import { useEffect, useState, useMemo, type JSX } from "react";
import { Link } from "react-router";
import { getLeaderboard } from "../services/user";
import type { LeaderboardItem } from "../types/leaderboard";
import { useAuth } from "../hooks/auth";
import NavBar from "../components/navbar";
import { Footer } from "../components/footer";
import Spinner from "../components/spinner";
import { HiTrophy, HiUser } from "react-icons/hi2";

export function LeaderboardPage(): JSX.Element {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Leaderboard | League of Tamati";
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Errore durante il recupero della classifica:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboardData();
  }, []);

  // rank current user
  const { userRankIndex, isUserInTopList } = useMemo(() => {
    if (!user) return { userRankIndex: -1, isUserInTopList: false };

    const index = leaderboardData.findIndex(
      (item) => item.username.toLowerCase() === user.username.toLowerCase(),
    );

    // top 5 users
    return {
      userRankIndex: index,
      isUserInTopList: index >= 0 && index < 5,
    };
  }, [leaderboardData, user]);

  const loggedInUserData =
    userRankIndex >= 0 ? leaderboardData[userRankIndex] : null;

  // rank badge (gold, silver, bronze)
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="leaderboard-badge from-amber-300 to-yellow-600 text-slate-950 font-black text-sm shadow-md shadow-yellow-500/20">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="leaderboard-badge from-slate-200 to-slate-400 text-slate-950 font-black text-sm shadow-md">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="leaderboard-badge from-amber-600 to-amber-800 text-white font-black text-sm shadow-md">
          3
        </span>
      );
    }
    return (
      <span className="font-mono text-sm text-lol-text-muted font-bold pl-2">
        #{rank}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-lol-bg text-lol-text">
      <NavBar />

      <main className="grow max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* header */}
        <div className="text-center space-y-3 my-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lol-gold/10 border border-lol-gold/30 text-lol-gold text-xs sm:text-sm font-semibold tracking-widest uppercase">
            <HiTrophy size={16} /> Global Rankings
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-lol-gold drop-shadow-md tracking-wide font-cinzel">
            EXTREME GAME LEADERBOARD
          </h1>
          <p className="text-lol-text-muted text-sm sm:text-base max-w-lg mx-auto">
            Best League of Tamati players
          </p>
        </div>

        {/* table */}
        <div className="glass-panel p-2 mt-5 sm:p-6 relative overflow-hidden flex flex-col min-h-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center my-auto py-12 gap-3 text-lol-gold">
              <Spinner />
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center my-auto py-12 text-lol-text-muted space-y-2">
              <HiUser className="mx-auto text-4xl opacity-40" />
              <p>Leaderboard is empty</p>
            </div>
          ) : (
            <div className="flex flex-col grow justify-between">
              {/* scrollable table */}
              <div
                className={`overflow-x-auto overflow-y-auto transition-all ${
                  user && loggedInUserData && !isUserInTopList
                    ? "max-h-80"
                    : "max-h-100"
                }`}
              >
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-lol-bg/95 backdrop-blur-md z-10 text-xs uppercase tracking-wider text-lol-gold/80">
                    <tr className="border-b-3 border-b-lol-gold/70 text-sm">
                      <th className="py-3 px-4 w-16 text-center">Rank</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lol-gold/10">
                    {leaderboardData.map((item, index) => {
                      const rank = index + 1;
                      const isCurrentUser =
                        user?.username.toLowerCase() ===
                        item.username.toLowerCase();

                      return (
                        <tr
                          key={item.username}
                          className={`transition-colors duration-150 ${
                            isCurrentUser
                              ? "bg-emerald-950/40 hover:bg-emerald-950/60 border-y border-y-emerald-600"
                              : "hover:bg-lol-gold/5"
                          }`}
                        >
                          {/* rank column */}
                          <td className="py-3.5 px-4 text-center">
                            {renderRankBadge(rank)}
                          </td>

                          {/* player column */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/profile/${item.username}`}
                                className="relative shrink-0 group"
                              >
                                <img
                                  src={item.avatar}
                                  alt={`${item.username} avatar`}
                                  className={`w-10 h-10 rounded-xl object-cover border transition-transform group-hover:scale-105 ${
                                    isCurrentUser
                                      ? "border-emerald-600 shadow-md shadow-emerald-600/30"
                                      : "border-emerald-600/30"
                                  }`}
                                />
                                {isCurrentUser && (
                                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                                  </span>
                                )}
                              </Link>
                              <div className="flex flex-col">
                                <Link
                                  to={`/profile/${item.username}`}
                                  className={`font-semibold text-sm sm:text-base flex items-center gap-1.5 hover:underline ${
                                    isCurrentUser
                                      ? "text-emerald-400 font-bold"
                                      : "text-lol-text"
                                  }`}
                                >
                                  {item.username}
                                </Link>
                              </div>
                            </div>
                          </td>

                          {/* score column */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-base sm:text-lg text-lol-gold drop-shadow-sm">
                              {item.record_score}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* fixed row for current user if out of top 5 */}
              {user && loggedInUserData && !isUserInTopList && (
                <div className="mt-4 pt-3 border-t-2 border-dashed border-emerald-600/40">
                  <div className="flex items-center justify-between text-xs text-emerald-400 px-4 mb-2 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1">Your Rank</span>
                  </div>

                  <div className="bg-linear-to-r from-emerald-950/50 via-emerald-900/30 to-transparent rounded-xl border border-emerald-600/50 p-3.5 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                      {/* user rank */}
                      <div className="text-center min-w-8">
                        {renderRankBadge(userRankIndex + 1)}
                      </div>

                      {/* Avatar e Username con link al profilo */}
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/profile/${loggedInUserData.username}`}
                          className="relative shrink-0 group"
                        >
                          <img
                            src={loggedInUserData.avatar}
                            alt={`${loggedInUserData.username} avatar`}
                            className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-600 shadow-md shadow-emerald-600/30 transition-transform group-hover:scale-105"
                          />
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                          </span>
                        </Link>
                        <div className="flex flex-col">
                          <Link
                            to={`/profile/${loggedInUserData.username}`}
                            className="font-bold text-sm sm:text-base text-emerald-400 flex items-center gap-1.5 hover:underline"
                          >
                            {loggedInUserData.username}
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* user score */}
                    <div className="text-center">
                      <span className="font-mono font-extrabold text-lg text-lol-gold">
                        {loggedInUserData.record_score}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
