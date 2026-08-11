import ChampionsWiki from "./pages/wiki/wiki";
import { Route, Routes } from "react-router";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import HomePage from "./pages/home";
import { ResendEmailPage } from "./pages/auth/resend-email";
import { ResetPasswordPage } from "./pages/user/reset-password";
import { NotFoundPage } from "./pages/not-found";
import { ActivateAccountPage } from "./pages/auth/activate-account";
import { WikiDetailsPage } from "./pages/wiki/details";
import { ProtectedRoute } from "./components/security/protected-route";
import ExtremeGamePage from "./pages/game/extreme";
import { ProfilePage } from "./pages/user/profile";
import FriendsPage from "./pages/user/friendship";
import { LeaderboardPage } from "./pages/leaderboard";

function App() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* routes wrapper */}
      <Routes>
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />

        {/* public */}
        {/* homepage */}
        <Route path="/" element={<HomePage />} />

        {/* auth */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/send-email" element={<ResendEmailPage />} />
        <Route
          path="/activate-account/:token"
          element={<ActivateAccountPage />}
        />

        {/* wiki */}
        <Route path="/wiki" element={<ChampionsWiki />} />
        <Route path="/wiki/:championId" element={<WikiDetailsPage />} />

        {/* forgot password */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* leaderboard */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* private */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/friendship" element={<FriendsPage />} />
          <Route path="/game/extreme" element={<ExtremeGamePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
