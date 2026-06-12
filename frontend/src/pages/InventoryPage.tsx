import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/ui/PageShell';
import { StoneButton } from '../components/ui/StoneButton';
import { motion } from 'framer-motion';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusic } from '../hooks/useMusic';
import { SKINS, FONDOS, DISCOS, PORTADAS, CARTELES, MARCOS } from '../constants/assets';
import { getDiscoObtainHint } from '../constants/packages';
import type { SkinId, FondoId, DiscoId } from '../constants/assets';

type TabId = 'temas' | 'fondos' | 'discos';

export function InventoryPage() {
  const navigate = useNavigate();
  const { skinState, equipTheme, equipFondo, isSkinOwned, isFondoOwned, currentMenuFondo, equipDisco, isDiscoOwned } = useSkin();
  const { playEquip, playEquipFondo, playButtonClick, playLocked } = useAudio();
  const { playTrack, playOnce, state: musicState } = useMusic();
  const [activeTab, setActiveTab] = useState<TabId>('temas');

  const handleEquipTheme = (skinId: SkinId) => {
    playEquip();
    equipTheme(skinId);
  };

  const handleBuyTheme = (skinId: SkinId) => {
    playButtonClick();
    navigate('/store');
  };

  const handleEquipFondo = (fondoId: FondoId) => {
    playEquipFondo();
    equipFondo(fondoId);
  };

  const handleBuyFondo = (fondoId: FondoId) => {
    playButtonClick();
    navigate('/store');
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

  const handleLockedDisco = () => {
    playLocked();
    navigate('/store');
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
      signTexture={CARTELES.inventario}
      showFrame
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
                    className="relative w-full overflow-hidden"
                    style={{
                      padding: '4px',
                      borderImageSource: `url(${MARCOS.minecraft})`,
                      borderImageSlice: '24 24 24 24',
                      borderImageWidth: '24px',
                      borderImageRepeat: 'stretch',
                      borderStyle: 'solid',
                      backgroundImage: `url(${MARCOS.minecraft})`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: 'cover',
                    }}
                  >
                    <div
                      className={`
                        relative
                        bg-[#C4A46C]/90
                        border-4 border-[#5C3010]
                        overflow-hidden
                        ${equipped ? 'ring-4 ring-[#FFAA00]' : ''}
                        ${!owned ? 'opacity-60' : ''}
                      `}
                    >
                      {/* Theme cover image */}
                      <div className="relative w-full h-28 md:h-32 bg-cover bg-center" style={{
                        backgroundImage: `url(${PORTADAS.tema[skinId as keyof typeof PORTADAS.tema]})`,
                      }} />

                      {/* Name and premium badge */}
                      <div className="p-2">
                        <h4 className="font-pixel text-xs text-[#3D2817] uppercase text-center mb-1">
                          {skin.name}
                        </h4>
                        {skin.premium && (
                          <span className="block text-center font-pixel text-[10px] text-[#8B2500] uppercase mb-1">
                            ★ Premium ★
                          </span>
                        )}

                        {/* Action */}
                        {owned ? (
                          equipped ? (
                            <div className="text-center">
                              <span className="font-pixel text-[10px] text-[#1F3D16] animate-pulse">
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
                            <StoneButton
                              onClick={() => handleBuyTheme(skinId)}
                              variant="primary"
                              size="sm"
                              animate={false}
                            >
                              Comprar
                            </StoneButton>
                          </div>
                        )}
                      </div>
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
                <h3 className="font-pixel text-sm text-[#3D2817] uppercase text-center mb-3">
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
                        className="flex-shrink-0 relative w-36 overflow-hidden"
                        style={{
                          padding: '3px',
                          borderImageSource: `url(${MARCOS.minecraft})`,
                          borderImageSlice: '20 20 20 20',
                          borderImageWidth: '20px',
                          borderImageRepeat: 'stretch',
                          borderStyle: 'solid',
                          backgroundImage: `url(${MARCOS.minecraft})`,
                          backgroundRepeat: 'repeat',
                          backgroundSize: 'cover',
                        }}
                      >
                        <div
                          className={`
                            relative
                            bg-[#C4A46C]/90
                            border-2 border-[#5C3010]
                            p-2
                            ${equipped ? 'ring-4 ring-[#FFAA00]' : ''}
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
                          <p className="font-pixel text-[10px] text-center text-[#3D2817] uppercase mb-1 truncate">
                            {fondo.name}
                          </p>
                          {owned ? (
                            equipped ? (
                              <span className="block text-center font-pixel text-[10px] text-[#1F3D16]">
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
                            <StoneButton
                              onClick={() => handleBuyFondo(fondoId)}
                              variant="primary"
                              size="sm"
                              className="w-full py-1"
                              animate={false}
                            >
                              Comprar
                            </StoneButton>
                          )}
                        </div>
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
                const isOwned = skinState.unlockedDiscos.includes(id);
                const obtainHint = getDiscoObtainHint(id);

                return (
                  <div
                    key={id}
                    className="w-full overflow-hidden"
                    style={{
                      padding: '3px',
                      borderImageSource: `url(${MARCOS.minecraft})`,
                      borderImageSlice: '20 20 20 20',
                      borderImageWidth: '20px',
                      borderImageRepeat: 'stretch',
                      borderStyle: 'solid',
                      backgroundImage: `url(${MARCOS.minecraft})`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: 'cover',
                    }}
                  >
                    <div
                      className={`
                        flex items-center gap-4
                        bg-[#C4A46C]/90
                        border-2 border-[#5C3010]
                        p-3
                        ${isPlaying ? 'ring-2 ring-[#FFAA00]' : ''}
                        ${!isOwned ? 'opacity-60' : ''}
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
                        <p className="font-pixel text-sm text-[#3D2817] uppercase">
                          {disco.name}
                        </p>
                        {isPlaying && (
                          <span className="font-pixel text-xs text-[#1F3D16] animate-pulse">
                            ▶ Reproduciendo
                          </span>
                        )}
                        {skinState.equippedDisco === id && !isPlaying && (
                          <span className="font-pixel text-xs text-[#1F3D16]">
                            ✓ Equipado
                          </span>
                        )}
                        {!isOwned && obtainHint && (
                          <p className="font-pixel text-[10px] text-[#8B2500] uppercase mt-1">
                            🔒 {obtainHint}
                          </p>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2">
                        {isOwned ? (
                          <>
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
                          </>
                        ) : (
                          <StoneButton
                            onClick={handleLockedDisco}
                            variant="primary"
                            size="sm"
                            animate={false}
                          >
                            Obtener
                          </StoneButton>
                        )}
                      </div>
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