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
        p-3 w-[260px]
        ${isEquipped ? 'ring-4 ring-mc-gold' : ''}
      `}
    >
      {/* Item frame effect for preview - usar object-contain para no cortar */}
      <div className="relative mb-2">
        <div className="absolute inset-0 bg-mc-woodDark" style={{ transform: 'translate(3px, 3px)' }} />
        <img
          src={previewSrc}
          alt={name}
          className="relative w-full h-32 md:h-36 object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Name */}
      <h3 className="font-pixel text-sm text-mc-gold uppercase mb-1 text-center">
        {name}
      </h3>

      {/* Description */}
      <p className="font-pixel text-[10px] text-mc-textMuted text-center mb-2 uppercase">
        {description}
      </p>

      {/* Status / Action */}
      {isEquipped ? (
        <div className="text-center">
          <span className="font-pixel text-[10px] text-mc-gold animate-pulse uppercase">
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
  const { skinState, equipTheme, isSkinOwned, currentFondo } = useSkin();
  const { playPurchase } = useAudio();
  const { playTrack } = useMusicWithControl();
  const [bonusActive, setBonusActive] = useState(false);

  // Auto-play the equipped disco on mount
  useEffect(() => {
    playTrack(skinState.equippedDisco);
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
      backgroundSrc={currentFondo?.file ?? FONDOS.overworld.file}
      showBackButton={true}
      backTo="/"
    >
      <div className="space-y-8">
        {/* Packages grid - Only Nether and End (Overworld is base/default, not sold) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[640px] mx-auto">
          {/* Nether - Premium */}
          <PackageCard
            name="Nether"
            description="El inframundo ardiente"
            price="$4.99"
            isOwned={hasNether}
            isEquipped={skinState.equippedSkin === 'nether'}
            onPurchase={() => handlePurchase('nether')}
            onEquip={() => equipTheme('nether')}
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
            onEquip={() => equipTheme('end')}
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