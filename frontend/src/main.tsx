import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppRouter } from './router';
import { SkinProvider } from './hooks/useSkin';
import { MusicProvider } from './hooks/useMusic';
import './styles.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

const rootElement = document.getElementById('root')!;

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <BrowserRouter>
      <MusicProvider>
        <SkinProvider>
          <AppRouter />
        </SkinProvider>
      </MusicProvider>
    </BrowserRouter>
  </ClerkProvider>
);
