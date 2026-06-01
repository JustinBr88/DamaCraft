import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';

const navItems = [
  { to: '/game', label: 'Jugar' },
  { to: '/store', label: 'Tienda' },
  { to: '/leaderboard', label: 'Tablero' },
  { to: '/inventory', label: 'Inventario' },
];

export function RootLayout() {
  const location = useLocation();
  const { playButtonClick } = useAudio();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar - overlay on top of page content */}
      <nav className="relative z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-mc-bgDarker/90 backdrop-blur-md border-b-4 border-mc-woodDark">
        {/* Logo */}
        <Link
          to="/"
          className="font-pixel text-xl md:text-2xl text-mc-gold uppercase tracking-wider"
          style={{ textShadow: '2px 2px 0 #5C3010' }}
          onClick={() => playButtonClick()}
        >
          DamaCraft
        </Link>

        {/* Nav buttons - only show when signed in */}
        <SignedIn>
          <div className="flex gap-2 md:gap-4">
            {navItems.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => playButtonClick()}
                  className={`
                    hidden md:block
                    px-3 py-2
                    font-pixel text-xs md:text-sm uppercase
                    border-4 border-t-4 border-b-4 border-l-4 border-r-4
                    transition-all
                    ${isActive
                      ? 'bg-mc-gold text-mc-bgDarker border-mc-gold'
                      : 'bg-mc-stone text-mc-textLight border-mc-stoneDark hover:bg-mc-stoneDark'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SignedIn>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                onClick={() => playButtonClick()}
                className="
                  px-4 py-2
                  font-pixel text-sm uppercase
                  bg-mc-gold text-mc-bgDarker
                  border-4 border-t-4 border-b-4 border-l-4 border-r-4 border-mc-goldDark
                  hover:bg-mc-goldDark
                  transition-all
                "
              >
                Entrar
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Mobile nav - horizontal scroll */}
      <SignedIn>
        <div className="md:hidden overflow-x-auto border-b-4 border-mc-woodDark bg-mc-bgDarker/90 backdrop-blur-md">
          <div className="flex px-2 py-2 gap-2">
            {navItems.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => playButtonClick()}
                  className={`
                    flex-shrink-0
                    px-3 py-2
                    font-pixel text-xs uppercase
                    border-4 border-t-4 border-b-4 border-l-4 border-r-4
                    ${isActive
                      ? 'bg-mc-gold text-mc-bgDarker border-mc-gold'
                      : 'bg-mc-stone text-mc-textLight border-mc-stoneDark'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </SignedIn>

      {/* Main Content */}
      <main className="flex-1 relative">
        <Outlet />
      </main>
    </div>
  );
}