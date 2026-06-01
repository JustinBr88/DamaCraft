import React, { useState } from 'react';
import { PageShell } from '../components/ui/PageShell';
import { StoneButton } from '../components/ui/StoneButton';
import { motion } from 'framer-motion';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusic } from '../hooks/useMusic';
import { SKINS, FONDOS, DISCOS, PORTADAS } from '../constants/assets';
import type { SkinId, FondoId, DiscoId } from '../constants/assets';

type TabId = 'fichas' | 'fondos' | 'discos';

export function InventoryPage() {
  const { skinState, equipSkin, equipFondo, equipMenuFondo, isSkinOwned, isFondoOwned } = useSkin();
  const { playEquip, playEquipFondo, playButtonClick } = useAudio();
  const { playTrack, playOnce, state: musicState } = useMusic();
  const [activeTab, setActiveTab] = useState<TabId>('fichas');

  const handleEquipSkin = (skinId: SkinId) => {
    playEquip();
    equipSkin(skinId);
  };

  const handleEquipFondo = (fondoId: FondoId) => {
    playEquipFondo();
    equipFondo(fondoId);
  };

  const handleEquipMenuFondo = (fondoId: FondoId) => {
    playEquipFondo();
    equipMenuFondo(fondoId);
  };

  const handlePlayDisco = (discoId: DiscoId) => {
    playButtonClick();
    playTrack(discoId);
  };

  const handlePlayOnce = (discoId: DiscoId) => {
    playButtonClick();
    playOnce(discoId);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'fichas', label: 'Fichas' },
    { id: 'fondos', label: 'Fondos' },
    { id: 'discos', label: 'Discos' },
  ];

  return (
    <PageShell
      title="Inventario"
      backgroundSrc={FONDOS.menu.file}
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
          {/* FICHAS TAB */}
          {activeTab === 'fichas' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
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
                      p-4
                      ${equipped ? 'ring-4 ring-mc-gold' : ''}
                      ${!owned ? 'opacity-60' : ''}
                    `}
                  >
                    {/* Preview image */}
                    <div className="relative mb-3">
                      <img
                        src={skin.preview}
                        alt={skin.name}
                        className="w-full h-24 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="font-pixel text-sm text-mc-gold uppercase text-center mb-2">
                      {skin.name}
                    </h3>

                    {/* Premium badge */}
                    {skin.premium && (
                      <span className="block text-center font-pixel text-xs text-mc-netherGlow uppercase mb-2">
                        ★ Premium ★
                      </span>
                    )}

                    {/* Action */}
                    {owned ? (
                      equipped ? (
                        <div className="text-center">
                          <span className="font-pixel text-xs text-mc-gold animate-pulse">
                            ★ EQUIPADO ★
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <StoneButton
                            onClick={() => handleEquipSkin(skinId)}
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
                        <span className="font-pixel text-xs text-mc-textMuted uppercase">
                          🔒 Bloqueado
                        </span>
                      </div>
                    )}
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
              {/* TEMA (Game theme - affects pieces and board textures) */}
              <div>
                <h3 className="font-pixel text-sm text-mc-gold uppercase text-center mb-3">
                  Tema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="relative w-full aspect-[4/3] bg-cover bg-center" style={{
                          backgroundImage: `url(${PORTADAS.tema[skinId as keyof typeof PORTADAS.tema]})`,
                        }} />

                        {/* Name and premium badge */}
                        <div className="p-3">
                          <h4 className="font-pixel text-sm text-mc-textLight uppercase text-center mb-1">
                            {skin.name}
                          </h4>
                          {skin.premium && (
                            <span className="block text-center font-pixel text-xs text-mc-netherGlow uppercase mb-2">
                              ★ Premium ★
                            </span>
                          )}

                          {/* Action */}
                          {owned ? (
                            equipped ? (
                              <div className="text-center">
                                <span className="font-pixel text-xs text-mc-gold animate-pulse">
                                  ★ EQUIPADO ★
                                </span>
                              </div>
                            ) : (
                              <div className="text-center">
                                <StoneButton
                                  onClick={() => handleEquipSkin(skinId)}
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
                              <span className="font-pixel text-xs text-mc-textMuted uppercase">
                                🔒 Bloqueado
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fondo del Menú */}
              <div>
                <h3 className="font-pixel text-sm text-mc-gold uppercase text-center mb-3">
                  Fondo del Menú
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Object.keys(FONDOS) as FondoId[]).map(fondoId => {
                    const fondo = FONDOS[fondoId];
                    const owned = isFondoOwned(fondoId);
                    const equipped = skinState.equippedMenuFondo === fondoId;

                    return (
                      <div
                        key={`menu-${fondoId}`}
                        className={`
                          relative
                          bg-mc-stone border-4 border-mc-stoneDark
                          p-2
                          ${equipped ? 'ring-4 ring-mc-gold' : ''}
                          ${!owned ? 'opacity-50' : ''}
                        `}
                      >
                        <div
                          className="w-full h-16 mb-2"
                          style={{
                            backgroundColor:
                              fondo.theme === 'nether' ? '#8B2500' :
                              fondo.theme === 'end' ? '#4B0082' :
                              '#7B8D3A',
                          }}
                        />
                        <p className="font-pixel text-xs text-center text-mc-textLight uppercase">
                          {fondo.name}
                        </p>
                        {owned ? (
                          equipped ? (
                            <span className="block text-center font-pixel text-xs text-mc-gold">
                              ✓ Menú
                            </span>
                          ) : (
                            <StoneButton
                              onClick={() => handleEquipMenuFondo(fondoId)}
                              variant="secondary"
                              size="sm"
                              className="mt-2 w-full"
                              animate={false}
                            >
                              Menú
                            </StoneButton>
                          )
                        ) : (
                          <span className="block text-center font-pixel text-xs text-mc-textMuted">
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