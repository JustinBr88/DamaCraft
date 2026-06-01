import { Route, Routes } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { GameLayout } from './layouts/GameLayout';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { StorePage } from './pages/StorePage';
import { InventoryPage } from './pages/InventoryPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AuthGuard } from './components/AuthGuard';

// ─── Router Component ─────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <Routes>
      {/* Root layout with nav - Home, Store, Leaderboard, Inventory */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/store"
          element={
            <AuthGuard>
              <StorePage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory"
          element={
            <AuthGuard>
              <InventoryPage />
            </AuthGuard>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <AuthGuard>
              <LeaderboardPage />
            </AuthGuard>
          }
        />
      </Route>

      {/* Game layout - no nav, full screen game */}
      <Route
        element={
          <AuthGuard>
            <GameLayout />
          </AuthGuard>
        }
      >
        <Route path="/game" element={<GamePage />} />
      </Route>
    </Routes>
  );
}