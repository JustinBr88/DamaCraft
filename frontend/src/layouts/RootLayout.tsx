import React from 'react';
import { Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useAudio } from '../hooks/useAudio';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Compact header with logo + user button (no navbar)
function CompactHeader() {
  const { playButtonClick } = useAudio();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-mc-bgDarker/90 backdrop-blur-md border-b-4 border-mc-woodDark"
    >
      {/* Logo - always visible */}
      <Link
        to="/"
        className="font-pixel text-xl md:text-2xl text-mc-gold uppercase tracking-wider"
        style={{ textShadow: '2px 2px 0 #5C3010' }}
        onClick={() => playButtonClick()}
      >
        DamaCraft
      </Link>

      {/* Auth buttons - right side */}
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button
              onClick={() => playButtonClick()}
              className="
                px-4 py-2
                font-pixel text-sm uppercase
                bg-mc-gold text-mc-bgDarker
                border-4 border-mc-goldDark
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
    </motion.header>
  );
}

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Compact header with logo + user button (no navbar) */}
      <CompactHeader />

      {/* Main Content */}
      <main className="flex-1 relative">
        <Outlet />
      </main>
    </div>
  );
}