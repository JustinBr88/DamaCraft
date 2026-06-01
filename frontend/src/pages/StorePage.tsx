import React, { useState, useEffect } from 'react';
import { PageShell } from '../components/ui/PageShell';
import { WoodSign } from '../components/ui/WoodSign';
import { StoneButton } from '../components/ui/StoneButton';
import { motion } from 'framer-motion';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusicWithControl } from '../hooks/useMusic';
import { SKINS, FONDOS, PORTADAS } from '../constants/assets';

interface PackageCardProps {
  name: string;
  description: string;
  price?: string;
  isOwned: boolean;
  isEquipped: boolean;
  onPurchase?: () => void;
  onEquip?: () => void;
  previewSrc: string;
}

function PackageCard({ name, description, price, isOwned, isEquipped, onPurchase, onEquip, previewSrc }: PackageCardProps) {
  const { playPurchase } = useAudio();

  const handlePurchase = () => {
    playPurchase();
    onPurchase?.();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative
        bg-gradient-to-b from-mc-stone to-mc-stoneDark
        border-4 border-mc-stoneDark
        p-4 md:p-6
        ${isEquipped ? 'ring-4 ring-mc-gold' : ''}
      `}
    >
      {/* Item frame effect for preview */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-mc-woodDark" style={{ transform: 'translate(4px, 4px)' }} />
        <img
          src={previewSrc}
          alt={name}
          className="relative w-full h-32 object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Name */}
      <h3 className="font-pixel text-lg text-mc-gold uppercase mb-2 text-center">
        {name}
      </h3>

      {/* Description */}
      <p className="font-pixel text-xs text-mc-textMuted text-center mb-4 uppercase">
        {description}
      </p>

      {/* Status / Action */}
      {isEquipped ? (
        <div className="text-center">
          <span className="font-pixel text-sm text-mc-gold animate-pulse uppercase">
            ★ Equipado ★
          </span>
        </div>
      ) : isOwned ? (
        <StoneButton onClick={onEquip} variant="secondary" size="sm" animate={false}>
          Equipar
        </StoneButton>
      ) : (
        <div className="text-center">
          <StoneButton onClick={handlePurchase} variant="primary" size="sm" animate={false}>
            {price ?? 'Comprar'}
          </StoneButton>
        </div>
      )

      }
    </motion.div>
  );
}

export function StorePage() {
  const { skinState, equipSkin, isSkinOwned } = useSkin();
  const { playPurchase } = useAudio();
  const { playTrack, stopMusic } = useMusicWithControl();
  const [bonusActive, setBonusActive] = useState(false);

  // Auto-play store music on mount
  useEffect(() => {
    playTrack('store_music');
    return () => stopMusic();
  }, []);

  // Check if both premium skins are owned
  const hasNether = isSkinOwned('nether');
  const hasEnd = isSkinOwned('end');
  const hasBonus = hasNether && hasEnd;

  const handlePurchase = (skinId: 'nether' | 'end') => {
    // TODO: Integrate with Stripe
    playPurchase();
    // For now, just unlock
    // In real implementation, this would be Stripe checkout
  };

  return (
    <PageShell
      title="Tienda"
      backgroundSrc={FONDOS.overworld.file}
      showBackButton={true}
      backTo="/"
    >
      <div className="space-y-8">
        {/* Packages grid - Only Nether and End (Overworld is base/default, not sold) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Nether - Premium */}
          <PackageCard
            name="Nether"
            description="El inframundo ardiente"
            price="$4.99"
            isOwned={hasNether}
            isEquipped={skinState.equippedSkin === 'nether'}
            onPurchase={() => handlePurchase('nether')}
            onEquip={() => equipSkin('nether')}
            previewSrc={PORTADAS.tienda.nether}
          />

          {/* End - Premium */}
          <PackageCard
            name="The End"
            description="El reino del vacío"
            price="$4.99"
            isOwned={hasEnd}
            isEquipped={skinState.equippedSkin === 'end'}
            onPurchase={() => handlePurchase('end')}
            onEquip={() => equipSkin('end')}
            previewSrc={PORTADAS.tienda.end}
          />
        </div>

        {/* Bonus section */}
        {hasBonus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="inline-block bg-mc-gold/20 border-4 border-mc-gold p-4">
              <p className="font-pixel text-lg text-mc-gold uppercase animate-pulse">
                ★ Bonus Desbloqueado: Música Exclusiva ★
              </p>
            </div>
          </motion.div>
        )}

        {/* Bonus indicator for unowned */}
        {!hasBonus && (
          <div className="text-center py-4">
            <div className="inline-block bg-mc-stone/50 border-4 border-mc-stoneDark p-4">
              <p className="font-pixel text-sm text-mc-textMuted uppercase">
                🎵 Comprando Nether + End = Bonus de Música
              </p>
            </div>
          </div>
        )}

        {/* Payment notice */}
        <p className="font-pixel text-xs text-mc-textMuted text-center uppercase">
          Los pagos son procesados de forma segura con Stripe
        </p>
      </div>
    </PageShell>
  );
}