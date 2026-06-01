import React from 'react';
import { Outlet } from 'react-router-dom';
import { VideoBackground } from '../components/ui/VideoBackground';
import { useSkin } from '../hooks/useSkin';
import { FONDOS } from '../constants/assets';

export function GameLayout() {
  const { currentFondo } = useSkin();
  const fondoSrc = currentFondo?.file ?? FONDOS.overworld.file;

  return (
    <VideoBackground videoSrc={fondoSrc} className="min-h-screen">
      <Outlet />
    </VideoBackground>
  );
}