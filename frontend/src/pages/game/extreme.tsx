import { useEffect, useState, type JSX } from "react";
import CircularTimer from "../../components/circle-timer";
import {
  checkExtremeGame,
  currentExtremeRound,
  endExtremeGame,
  getSearchChampions,
  startExtremeGame,
} from "../../services/game";
import type {
  AbilityKey,
  ChampionSearch,
  ExtremeGameResponse,
  ExtremeGameUserAnswer,
} from "../../types/game";
import NavBar from "../../components/navbar";
import { Footer } from "../../components/footer";
import { RiCloseCircleFill } from "react-icons/ri";
import { getTimeInterval } from "../../utils/timer";
import { isAxiosError } from "axios";
import Spinner from "../../components/spinner";
import { GameOverModal } from "../../components/gameover-modal";
import { HiTrophy, HiFire } from "react-icons/hi2";
import { getUserData } from "../../services/user";
import { useAuth } from "../../hooks/auth";

const abilityKeys: AbilityKey[] = ["passive", "q", "w", "e", "r"];

export default function ExtremeGamePage(): JSX.Element {
  useEffect(() => {
    document.title = "Extreme Game Mode | League of Tamati";
  }, []);

  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [data, setData] = useState<ExtremeGameResponse | null>(null);
  const [searchChampions, setSearchChampions] = useState<
    ChampionSearch[] | null
  >(null);
  const [searchResults, setSearchResults] = useState<ChampionSearch[] | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<ExtremeGameUserAnswer>({
    round_id: 0,
    champion_name: "",
    ability_id: null,
  });

  const [timer, setTimer] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [gameOverModal, setGameOverModal] = useState<{
    isOpen: boolean;
    correctChampionName: string;
    correctAbilityId: string;
    correctChampionSpellIcon: string;
    correctChampionId: string;
    correctChampionImage: string;
    finalScore: number;
    reason: "wrong" | "timeout";
  }>({
    isOpen: false,
    correctChampionName: "",
    correctAbilityId: "",
    correctChampionSpellIcon: "",
    correctChampionId: "",
    correctChampionImage: "",
    finalScore: 0,
    reason: "wrong",
  });

  // sync current round if exists
  useEffect(() => {
    const syncExtremeRound = async () => {
      Promise.all([currentExtremeRound(), getSearchChampions()])
        .then(([response, champions]) => {
          setData(response);
          setSearchChampions(champions);
          setOnProgress(true);
          setUserAnswer({
            round_id: response.round_id,
            champion_name: "",
            ability_id: null,
          });
          setTimer(
            getTimeInterval(
              new Date(response.server_now).getTime(),
              response.expires_at,
            ),
          );
        })
        .catch((error) => console.error(error));
    };
    syncExtremeRound();
  }, []); // triggered on mount

  const { user } = useAuth();

  const [recordScore, setRecordScore] = useState(user?.extreme_game_record);

  useEffect(() => {
    const updateScore = async () => {
      const response = await getUserData();
      setRecordScore(response.extreme_game_record);
    };
    updateScore();
  }, []);

  // start round
  const handleStart = async () => {
    Promise.all([startExtremeGame(), getSearchChampions()])
      .then(([response, champions]) => {
        setData(response);
        setSearchChampions(champions);
        setOnProgress(true);
        setUserAnswer({
          round_id: response.round_id,
          champion_name: "",
          ability_id: null,
        });
        setTimer(
          getTimeInterval(
            new Date(response.server_now).getTime(),
            response.expires_at,
          ),
        );
      })
      .catch((error) => console.error(error));
  };

  // search champions
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);

    if (!value.trim() || !searchChampions) setSearchResults(null);

    const filtered = searchChampions?.filter((champion) =>
      champion.champ_name.toLowerCase().includes(value.toLowerCase()),
    );

    setSearchResults(filtered || []);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchResults(null);
    setUserAnswer({ ...userAnswer, champion_name: "" });
  };

  // handling user inputs
  const handleSelectChampion = (champion: ChampionSearch) => {
    setUserAnswer({ ...userAnswer, champion_name: champion.champ_name });
    setSearchResults(null);
    setSearchInput(champion.champ_name);
  };

  const handleSelectAbility = (ability: AbilityKey) => {
    setUserAnswer({ ...userAnswer, ability_id: ability });
  };

  // handling game logic
  const handleConfirmAnswer = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await checkExtremeGame(userAnswer);

      if (response.correct) {
        setData(response.next_round);
        setSearchInput("");
        setUserAnswer({
          round_id: response.next_round!.round_id,
          champion_name: "",
          ability_id: null,
        });

        // correct answer => next round starts
        setTimer(
          getTimeInterval(
            new Date(response.next_round!.server_now).getTime(),
            response.next_round!.expires_at,
          ),
        );
      } else {
        setOnProgress(false);
        setSearchInput("");
        setUserAnswer({
          round_id: 0,
          champion_name: "",
          ability_id: null,
        });
        setGameOverModal({
          isOpen: true,
          correctChampionName: response.correct_champion_name,
          correctAbilityId: response.correct_ability_id,
          correctChampionSpellIcon: response.correct_champion_spell_icon,
          correctChampionId: response.correct_champion_id,
          correctChampionImage: response.correct_champion_image,
          finalScore: response.current_score,
          reason: "wrong",
        });

        const updated = await getUserData();
        setRecordScore(updated.extreme_game_record);
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        //
      } else {
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuit = async () => {
    await endExtremeGame();
    setSearchInput("");
    setUserAnswer({ ...userAnswer, champion_name: "", ability_id: null });
    setOnProgress(false);
  };

  const handleTimeout = async () => {
    if (isSubmitting) return;

    if (userAnswer.champion_name && userAnswer.ability_id) {
      await handleConfirmAnswer();
    } else {
      setOnProgress(false);
      setSearchInput("");
      setUserAnswer({
        round_id: 0,
        champion_name: "",
        ability_id: null,
      });
      try {
        const timeoutResult = await checkExtremeGame({
          ...userAnswer,
          champion_name: userAnswer.champion_name || "__timeout__",
          ability_id: userAnswer.ability_id || "q",
        });
        setGameOverModal({
          isOpen: true,
          correctChampionName: timeoutResult.correct_champion_name,
          correctAbilityId: timeoutResult.correct_ability_id,
          correctChampionSpellIcon: timeoutResult.correct_champion_spell_icon,
          correctChampionId: timeoutResult.correct_champion_id,
          correctChampionImage: timeoutResult.correct_champion_image,
          finalScore: timeoutResult.current_score,
          reason: "timeout",
        });
      } catch {
        setGameOverModal({
          isOpen: true,
          correctChampionName: "",
          correctAbilityId: "",
          correctChampionSpellIcon: "",
          correctChampionId: "",
          correctChampionImage: "",
          finalScore: data?.current_score ?? 0,
          reason: "timeout",
        });

        const updated = await getUserData();
        setRecordScore(updated.extreme_game_record);
      }
    }
  };

  const isDisabled =
    isSubmitting ||
    userAnswer.champion_name === "" ||
    userAnswer.ability_id === null;

  const handleCloseGameOver = () => {
    setGameOverModal((prev) => ({ ...prev, isOpen: false }));
    const updateData = async () => await getUserData();
    updateData().then((res) => setRecordScore(res.extreme_game_record));
  };

  // Rendering Start Screen
  if (!onProgress || !data) {
    return (
      <div className="flex flex-col min-h-dvh bg-lol-bg text-lol-text">
        <GameOverModal
          isOpen={gameOverModal.isOpen}
          correctChampionName={gameOverModal.correctChampionName}
          correctChampionId={gameOverModal.correctChampionId}
          correctChampionSpellIcon={gameOverModal.correctChampionSpellIcon}
          correctChampionImage={gameOverModal.correctChampionImage}
          correctAbilityId={gameOverModal.correctAbilityId}
          finalScore={gameOverModal.finalScore}
          reason={gameOverModal.reason}
          onClose={handleCloseGameOver}
        />
        <NavBar />

        <div className="bg-lol-blue w-[95vw] mx-auto border-3 rounded-md border-lol-blue-light flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/50 border border-rose-400 text-rose-400 text-xs sm:text-sm font-semibold tracking-widest uppercase animate-pulse">
              <HiFire /> Hardcore Mode
            </div>

            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-6xl font-extrabold text-lol-gold drop-shadow-lg"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                EXTREME GAME
              </h1>
              <div className="text-lol-text text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                <p>
                  An ability description will appear — guess which champion it
                  belongs to and the correct spell key. If time runs out but
                  you've already entered both answers, the round will still be
                  checked. One mistake, or a timeout with no answer at all, ends
                  the run!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-lol-gold">
                Record Score:
              </h2>
              <span className="text-3xl font-mono text-lol-text-muted">
                {recordScore}
              </span>
            </div>

            <button
              type="button"
              className="btn px-8 py-4 mx-auto rounded-xl text-xl font-bold transition-all"
              onClick={handleStart}
            >
              Start Game
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Rendering Active Game Screen
  return (
    <div className="flex flex-col min-h-dvh bg-lol-bg text-lol-text">
      <GameOverModal
        isOpen={gameOverModal.isOpen}
        correctChampionName={gameOverModal.correctChampionName}
        correctChampionId={gameOverModal.correctChampionId}
        correctChampionSpellIcon={gameOverModal.correctChampionSpellIcon}
        correctChampionImage={gameOverModal.correctChampionImage}
        correctAbilityId={gameOverModal.correctAbilityId}
        finalScore={gameOverModal.finalScore}
        reason={gameOverModal.reason}
        onClose={handleCloseGameOver}
      />

      <main className="grow max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Game Header Bar: Score & Timer */}
        <div className="sticky top-0 z-100 glass-panel p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lol-gold/10 text-lol-gold border border-lol-gold/40">
              <HiTrophy size={25} />
            </div>
            <div>
              <p className="text-xs text-lol-text-muted uppercase tracking-wider font-semibold">
                Current Score
              </p>
              <p className="text-3xl font-extrabold text-lol-gold font-mono">
                {data.current_score}
              </p>
            </div>
          </div>

          <CircularTimer
            key={data.round_id}
            duration={timer}
            isRunning={timer >= 0}
            onComplete={handleTimeout}
          />
        </div>

        {/* Game Body: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Ability Description */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-lol-gold/20 pb-3">
                <h3
                  className="text-xl sm:text-2xl font-bold text-lol-gold"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  Ability Description
                </h3>
                <span className="text-xs text-lol-text-muted px-2.5 py-1 rounded-md bg-lol-card border border-lol-blue-light/50">
                  Round #{data.round_id}
                </span>
              </div>

              <p className="text-base sm:text-lg leading-relaxed text-lol-text/95">
                {data.ability_description.split(" ").map((word, index) => {
                  if (/\?{6}/.test(word)) {
                    return (
                      <span
                        key={index}
                        className="backdrop-blur blur-[7px] bg-lol-text/70 text-lol-text px-1.5 py-0.5 rounded font-mono text-sm mx-1"
                      >
                        {word}{" "}
                      </span>
                    );
                  }
                  return " " + word + " ";
                })}
              </p>
            </div>

            <p className="text-xs text-lol-text-muted/70 italic pt-4">
              Tip: The champion name and specific values have been masked with
              blurred symbols.
            </p>
          </div>

          {/* Right Column: User Answer Form */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3
                className="text-xl sm:text-2xl font-bold text-lol-gold border-b border-lol-gold/20 pb-3"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                Your Answer
              </h3>

              {/* Champion Search Autocomplete */}
              <div className="space-y-2">
                <label className="text-xs text-lol-text-muted uppercase font-semibold tracking-wider">
                  1. Select Champion
                </label>
                <div className="relative">
                  <input
                    type="search"
                    name="searchChampion"
                    id="searchChampion"
                    placeholder="Type champion name..."
                    className="w-full bg-lol-card text-lol-text text-sm rounded-xl p-3 pr-10 border border-lol-blue-light/60 focus:border-lol-gold focus:outline-none focus:ring-1 focus:ring-lol-gold transition-all"
                    value={searchInput}
                    onChange={handleSearch}
                  />

                  {searchInput && (
                    <RiCloseCircleFill
                      size={20}
                      className="absolute top-1/2 -translate-y-1/2 right-3 text-red-400 opacity-80 cursor-pointer hover:opacity-100"
                      onClick={handleClearSearch}
                    />
                  )}

                  {/* Autocomplete Dropdown */}
                  {searchResults && searchInput && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-lol-bg border border-lol-gold/40 rounded-xl max-h-60 overflow-y-auto z-30 shadow-2xl divide-y divide-lol-gold/10">
                      {searchResults.length === 0 ? (
                        <p className="p-3 text-xs text-lol-text-muted text-center">
                          No champion found
                        </p>
                      ) : (
                        searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center gap-3 p-2.5 hover:bg-lol-gold/10 cursor-pointer transition-colors"
                            onClick={() => handleSelectChampion(result)}
                          >
                            <img
                              src={result.champ_icon}
                              alt={result.champ_name}
                              className="w-8 h-8 rounded-lg border border-lol-gold/30 object-cover"
                            />
                            <span className="text-sm font-semibold text-lol-text">
                              {result.champ_name}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ability Key Selector Buttons */}
              <div className="space-y-2">
                <label className="text-xs text-lol-text-muted uppercase font-semibold tracking-wider">
                  2. Select Ability Key
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {abilityKeys.map((id) => {
                    const isSelected = userAnswer.ability_id === id;
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => handleSelectAbility(id)}
                        className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex flex-col items-center justify-center border ${
                          isSelected
                            ? "bg-lol-gold text-lol-bg border-lol-gold-light shadow-lg shadow-lol-gold/30 scale-105"
                            : "bg-lol-card/80 text-lol-text-muted border-lol-blue-light/60 hover:text-lol-text hover:border-lol-gold/40"
                        }`}
                      >
                        <span className="uppercase text-xs">
                          {id === "passive" ? "P" : id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-lol-gold/20 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                className={`btn flex-1 py-3 rounded-xl font-bold text-sm shadow-md ${
                  isDisabled
                    ? "opacity-50 pointer-events-none cursor-not-allowed"
                    : ""
                }`}
                onClick={handleConfirmAnswer}
                disabled={isDisabled}
              >
                {isSubmitting ? (
                  <span className="cursor-pointer flex items-center justify-center gap-2">
                    <span>Checking...</span> <Spinner />
                  </span>
                ) : (
                  "Submit Answer"
                )}
              </button>

              <button
                type="button"
                className="cursor-pointer py-3 px-6 rounded-xl font-semibold text-sm border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={handleQuit}
                disabled={isSubmitting}
              >
                Quit Game
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
