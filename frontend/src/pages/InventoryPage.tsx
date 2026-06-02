import React, { useState } from 'react';
import { PageShell } from '../components/ui/PageShell';
import { StoneButton } from '../components/ui/StoneButton';
import { motion } from 'framer-motion';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusic } from '../hooks/useMusic';
import { SKINS, FONDOS, DISCOS, PORTADAS } from '../constants/assets';
import type { SkinId, FondoId, DiscoId } from '../constants/assets';

type TabId = 'temas' | 'fondos' | 'discos';

export function InventoryPage() {
  const { skinState, equipTheme, equipFondo, isSkinOwned, isFondoOwned, currentMenuFondo, equipDisco } = useSkin();
  const { playEquip, playEquipFondo, playButtonClick } = useAudio();
  const { playTrack, playOnce, state: musicState } = useMusic();
  const [activeTab, setActiveTab] = useState<TabId>('temas');

  const handleEquipTheme = (skinId: SkinId) => {
    playEquip();
    equipTheme(skinId);
  };

  const handleEquipFondo = (fondoId: FondoId) => {
    playEquipFondo();
    equipFondo(fondoId);
  };

  const handlePlayDisco = (discoId: DiscoId) => {
    playButtonClick();
    playTrack(discoId);
  };

  const handlePlayOnce = (discoId: DiscoId) => {
    playButtonClick();
    playOnce(discoId);
  };

  const handleEquipDisco = (discoId: DiscoId) => {
    playButtonClick();
    equipDisco(discoId);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'temas', label: 'Temas' },
    { id: 'fondos', label: 'Fondos' },
    { id: 'discos', label: 'Discos' },
  ];

  return (
    <PageShell
      title="Inventario"
      backgroundSrc={currentMenuFondo?.file ?? FONDOS.menu.file}
      showBackButton={true}
      backTo="/"
    >
      <div className="space-y-6 w-full">
        {/* Tab buttons */}
        <div className="flex justify-center gap-2">
          {tabs.map(tab => (
            <StoneButton
              key={tab.id}
              onClick={() => { playButtonClick(); setActiveTab(tab.id); }}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              size="sm"
              animate={false}
            >
              {tab.label}
            </StoneButton>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[300px]">
          {/* TEMAS TAB */}
          {activeTab === 'temas' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[680px] mx-auto"
            >
              {(Object.keys(SKINS) as SkinId[]).map(skinId => {
                const skin = SKINS[skinId];
                const owned = isSkinOwned(skinId);
                const equipped = skinState.equippedSkin === skinId;

                return (
                  <div
                    key={skinId}
                    className={`
                      relative
                      bg-gradient-to-b from-mc-stone to-mc-stoneDark
                      border-4 border-mc-stoneDark
                      overflow-hidden
                      ${equipped ? 'ring-4 ring-mc-gold' : ''}
                      ${!owned ? 'opacity-60' : ''}
                    `}
                  >
                    {/* Theme cover image */}
                    <div className="relative w-full h-28 md:h-32 bg-cover bg-center" style={{
                      backgroundImage: `url(${PORTADAS.tema[skinId as keyof typeof PORTADAS.tema]})`,
                    }} />

                    {/* Name and premium badge */}
                    <div className="p-2">
                      <h4 className="font-pixel text-xs text-mc-textLight uppercase text-center mb-1">
                        {skin.name}
                      </h4>
                      {skin.premium && (
                        <span className="block text-center font-pixel text-[10px] text-mc-netherGlow uppercase mb-1">
                          ★ Premium ★
                        </span>
                      )}

                      {/* Action */}
                      {owned ? (
                        equipped ? (
                          <div className="text-center">
                            <span className="font-pixel text-[10px] text-mc-gold animate-pulse">
                              ★ EQUIPADO ★
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <StoneButton
                              onClick={() => handleEquipTheme(skinId)}
                              variant="secondary"
                              size="sm"
                              animate={false}
                            >
                              Equipar
                            </StoneButton>
                          </div>
                        )
                      ) : (
                        <div className="text-center">
                          <span className="font-pixel text-[10px] text-mc-textMuted uppercase">
                            🔒 Bloqueado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* FONDOS TAB */}
          {activeTab === 'fondos' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Fondo */}
              <div>
                <h3 className="font-pixel text-sm text-mc-gold uppercase text-center mb-3">
                  Fondo
                </h3>
                {/* Horizontal scroll layout with real covers */}
                <div className="flex overflow-x-auto gap-3 pb-2 max-w-[700px] mx-auto scrollbar-hide">
                  {(Object.keys(FONDOS) as FondoId[]).map(fondoId => {
                    const fondo = FONDOS[fondoId];
                    const owned = isFondoOwned(fondoId);
                    const equipped = skinState.equippedFondo === fondoId;

                    // Map fondo to its matching cover image (real covers for fondos)
                    const coverUrl = PORTADAS.fondo[fondoId as keyof typeof PORTADAS.fondo] ?? PORTADAS.home.jugar;

                    return (
                      <div
                        key={`fondo-${fondoId}`}
                        className={`
                          flex-shrink-0
                          relative
                          bg-mc-stone border-4 border-mc-stoneDark
                          p-2
                          w-36
                          ${equipped ? 'ring-4 ring-mc-gold' : ''}
                          ${!owned ? 'opacity-50' : ''}
                        `}
                      >
                        {/* Cover image using object-contain */}
                        <div className="relative w-full h-20 mb-2 overflow-hidden rounded">
                          <img
                            src={coverUrl}
                            alt={fondo.name}
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'auto' }}
                          />
                        </div>
                        <p className="font-pixel text-[10px] text-center text-mc-textLight uppercase mb-1 truncate">
                          {fondo.name}
                        </p>
                        {owned ? (
                          equipped ? (
                            <span className="block text-center font-pixel text-[10px] text-mc-gold">
                              ✓ Equipado
                            </span>
                          ) : (
                            <StoneButton
                              onClick={() => handleEquipFondo(fondoId)}
                              variant="secondary"
                              size="sm"
                              className="w-full py-1"
                              animate={false}
                            >
                              Equipar
                            </StoneButton>
                          )
                        ) : (
                          <span className="block text-center font-pixel text-[10px] text-mc-textMuted">
                            🔒
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* DISCOS TAB */}
          {activeTab === 'discos' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {(Object.entries(DISCOS) as [DiscoId, typeof DISCOS[DiscoId]][]).map(([id, disco]) => {
                const isPlaying = musicState.currentTrack === id && musicState.isPlaying;

                return (
                  <div
                    key={id}
                    className={`
                      flex items-center gap-4
                      bg-mc-stone/50 border-2 border-mc-stoneDark
                      p-3
                      ${isPlaying ? 'ring-2 ring-mc-gold' : ''}
                    `}
                  >
                    {/* Disc image */}
                    <img
                      src={disco.disc}
                      alt={disco.name}
                      className="w-12 h-12 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />

                    {/* Track info */}
                    <div className="flex-1">
                      <p className="font-pixel text-sm text-mc-textLight uppercase">
                        {disco.name}
                      </p>
                      {isPlaying && (
                        <span className="font-pixel text-xs text-mc-gold animate-pulse">
                          ▶ Reproduciendo
                        </span>
                      )}
                      {skinState.equippedDisco === id && !isPlaying && (
                        <span className="font-pixel text-xs text-mc-gold">
                          ✓ Equipado
                        </span>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                      <StoneButton
                        onClick={() => handlePlayDisco(id)}
                        variant="secondary"
                        size="sm"
                        animate={false}
                      >
                        ▶
                      </StoneButton>
                      <StoneButton
                        onClick={() => handlePlayOnce(id)}
                        variant="secondary"
                        size="sm"
                        animate={false}
                      >
                        1×
                      </StoneButton>
                      {skinState.equippedDisco !== id && (
                        <StoneButton
                          onClick={() => handleEquipDisco(id)}
                          variant="primary"
                          size="sm"
                          animate={false}
                        >
                          Equipar
                        </StoneButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}