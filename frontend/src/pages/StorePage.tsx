import React, { useState, useEffect } from 'react';
import { PageShell } from '../components/ui/PageShell';
import { WoodSign } from '../components/ui/WoodSign';
import { StoneButton } from '../components/ui/StoneButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusicWithControl } from '../hooks/useMusic';
import { useCheckout } from '../hooks/useCheckout';
import { useAuth, SignInButton, useClerk } from '@clerk/clerk-react';
import { SKINS, FONDOS, PORTADAS, CARTELES, MARCOS } from '../constants/assets';
import { FRONTEND_PACKAGES } from '../constants/packages';
import type { PackageId } from '../constants/packages';

// ─── Purchase Modal ───────────────────────────────────────────────────

interface PurchaseModalProps {
  packageId: PackageId;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function PurchaseModal({ packageId, onConfirm, onCancel, isLoading, needsLogin }: PurchaseModalProps & { needsLogin?: boolean }) {
  const pkg = FRONTEND_PACKAGES[packageId];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-[90%] max-w-md"
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
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-[#3D2817] border-4 border-[#5C3010] p-4">
            <h3 className="font-pixel text-xl text-[#FFAA00] uppercase text-center mb-2">
              Confirmar compra
            </h3>
            <p className="font-pixel text-lg text-[#C4A46C] uppercase text-center mb-4">
              ¿Seguro que quieres comprar {pkg.displayName}?
            </p>

            {/* Package contents */}
            <div className="bg-[#5C3010]/50 border-2 border-[#8B6914] p-3 mb-4">
              <p className="font-pixel text-xs text-[#C4A46C] uppercase mb-2 text-center">
                Este paquete incluye:
              </p>
              <ul className="space-y-1">
                {pkg.packageContents.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-[#FFAA00]">✓</span>
                    <span className="font-pixel text-xs text-[#C4A46C]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="font-pixel text-sm text-[#FFAA00] uppercase text-center mb-4">
              Precio: {pkg.priceDisplay}
            </p>

            <div className="flex gap-3 justify-center">
              <StoneButton
                onClick={onCancel}
                variant="secondary"
                size="sm"
                animate={false}
                disabled={isLoading}
              >
                Cancelar
              </StoneButton>
              <StoneButton
                onClick={onConfirm}
                variant="primary"
                size="sm"
                animate={false}
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : needsLogin ? 'Iniciar sesión' : 'Confirmar'}
              </StoneButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Package Card ─────────────────────────────────────────────────────

interface PackageCardProps {
  packageId: PackageId;
  isOwned: boolean;
  isEquipped: boolean;
  onPurchase: () => void;
  onEquip: () => void;
}

// Track which packages have been purchased this session (before MongoDB updates)
function PackageCard({ packageId, isOwned, isEquipped, onPurchase, onEquip }: PackageCardProps) {
  const { playPurchase } = useAudio();
  const pkg = FRONTEND_PACKAGES[packageId];

  const handlePurchase = () => {
    playPurchase();
    onPurchase();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative w-[260px]"
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
          p-3
          ${isEquipped ? 'ring-4 ring-[#FFAA00]' : ''}
        `}
      >
        {/* Preview */}
        <div className="relative mb-2">
          <div className="absolute inset-0 bg-[#3D2817]" style={{ transform: 'translate(3px, 3px)' }} />
          <img
            src={PORTADAS.tienda[packageId === 'nether_pack' ? 'nether' : 'end']}
            alt={pkg.displayName}
            className="relative w-full h-32 md:h-36 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Name */}
        <h3 className="font-pixel text-sm text-[#3D2817] uppercase mb-1 text-center">
          {pkg.displayName}
        </h3>

        {/* Description */}
        <p className="font-pixel text-[10px] text-[#5C3010] text-center mb-2 uppercase">
          {pkg.description}
        </p>

        {/* Status / Action */}
        {isEquipped ? (
          <div className="text-center">
            <span className="font-pixel text-[10px] text-[#1F3D16] animate-pulse uppercase">
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
              {pkg.priceDisplay}
            </StoneButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Store Page ────────────────────────────────────────────────────────

export function StorePage() {
  const { skinState, equipTheme, isSkinOwned, refreshInventory } = useSkin();
  const { playPurchase } = useAudio();
  const { playTrack } = useMusicWithControl();
  const { startCheckout, isLoading: isCheckingOut, error: checkoutError } = useCheckout();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const currentFondo = FONDOS[skinState.equippedFondo] ?? FONDOS.overworld;

  const [showModal, setShowModal] = useState<PackageId | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<'success' | 'cancelled' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-play the equipped disco on mount
  useEffect(() => {
    playTrack(skinState.equippedDisco);
  }, []);

  // Handle redirect result from Stripe — poll inventory until unlock propagates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('purchase');
    const packageId = params.get('package');

    if (result && packageId) {
      setPurchaseResult(result as 'success' | 'cancelled');
      window.history.replaceState({}, '', '/store');

      if (result === 'success') {
        // Poll inventory until MongoDB updates
        setIsRefreshing(true);
        let attempts = 0;
        const maxAttempts = 8;
        const pollInterval = setInterval(async () => {
          await refreshInventory();
          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsRefreshing(false);
          }
        }, 1200); // poll every 1.2s

        // Auto-clear result after 12s even if not fully refreshed
        setTimeout(() => {
          clearInterval(pollInterval);
          setIsRefreshing(false);
          setPurchaseResult(null);
        }, 1200 * maxAttempts);
      } else {
        setTimeout(() => setPurchaseResult(null), 4000);
      }
    }
  }, []);

  const hasNether = isSkinOwned('nether');
  const hasEnd = isSkinOwned('end');
  const hasBonus = hasNether && hasEnd;

  const handlePurchaseAttempt = (packageId: PackageId) => {
    if (!isSignedIn) {
      setShowModal(packageId);
      return;
    }
    setShowModal(packageId);
  };

  const handleConfirmPurchase = async () => {
    if (!showModal) return;

    if (!isSignedIn) {
      setShowModal(null);
      openSignIn();
      return;
    }

    await startCheckout(showModal);
    setShowModal(null);
  };

  const handleEquip = (skinId: 'nether' | 'end') => {
    equipTheme(skinId);
  };

  return (
    <PageShell
      title="Tienda"
      backgroundSrc={currentFondo?.file ?? FONDOS.overworld.file}
      showBackButton={true}
      backTo="/"
      signTexture={CARTELES.tienda}
      showFrame
    >
      <div className="space-y-8">
        {/* Checkout error feedback */}
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div
              className="inline-block p-3 border-4"
              style={{
                backgroundImage: `url(${MARCOS.minecraft})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'cover',
                borderImageSource: `url(${MARCOS.minecraft})`,
                borderImageSlice: '20 20 20 20',
                borderImageWidth: '20px',
                borderImageRepeat: 'stretch',
                borderStyle: 'solid',
              }}
            >
              <div className="border-4 border-[#8B2500] bg-[#C4A46C]/90 px-6 py-2">
                <p className="font-pixel text-sm uppercase text-[#8B2500]">
                  ✗ {checkoutError}
                </p>
                <p className="font-pixel text-xs uppercase text-[#5C3010] mt-1">
                  Verificá que el backend esté corriendo.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Purchase result feedback */}
        <AnimatePresence>
          {purchaseResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div
                className="inline-block p-3 border-4"
                style={{
                  backgroundImage: `url(${MARCOS.minecraft})`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: 'cover',
                  borderImageSource: `url(${MARCOS.minecraft})`,
                  borderImageSlice: '20 20 20 20',
                  borderImageWidth: '20px',
                  borderImageRepeat: 'stretch',
                  borderStyle: 'solid',
                }}
              >
                <div
                  className={`border-4 px-6 py-2 ${
                    purchaseResult === 'success'
                      ? 'border-[#1F3D16] bg-[#C4A46C]/90'
                      : 'border-[#8B2500] bg-[#C4A46C]/90'
                  }`}
                >
                  <p className="font-pixel text-sm uppercase">
                    {purchaseResult === 'success'
                      ? isRefreshing
                        ? '⏳ Procesando compra...'
                        : '✓ ¡Paquete desbloqueado! Ya podés equiparlo.'
                      : '✗ Compra cancelada.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[640px] mx-auto">
          <PackageCard
            packageId="nether_pack"
            isOwned={hasNether}
            isEquipped={skinState.equippedSkin === 'nether'}
            onPurchase={() => handlePurchaseAttempt('nether_pack')}
            onEquip={() => handleEquip('nether')}
          />

          <PackageCard
            packageId="end_pack"
            isOwned={hasEnd}
            isEquipped={skinState.equippedSkin === 'end'}
            onPurchase={() => handlePurchaseAttempt('end_pack')}
            onEquip={() => handleEquip('end')}
          />
        </div>

        {/* Bonus section */}
        {hasBonus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div
              className="inline-block p-4"
              style={{
                backgroundImage: `url(${MARCOS.minecraft})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'cover',
                borderImageSource: `url(${MARCOS.minecraft})`,
                borderImageSlice: '24 24 24 24',
                borderImageWidth: '24px',
                borderImageRepeat: 'stretch',
                borderStyle: 'solid',
              }}
            >
              <div className="bg-[#3D2817]/95 border-4 border-[#FFAA00] px-6 py-3">
                <p
                  className="font-pixel text-lg text-[#FFAA00] uppercase animate-pulse"
                  style={{ textShadow: '2px 2px 0 #000' }}
                >
                  ★ Bonus Desbloqueado: Música Exclusiva ★
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bonus indicator for unowned */}
        {!hasBonus && (
          <div className="text-center py-4">
            <div
              className="inline-block p-4"
              style={{
                backgroundImage: `url(${MARCOS.minecraft})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'cover',
                borderImageSource: `url(${MARCOS.minecraft})`,
                borderImageSlice: '24 24 24 24',
                borderImageWidth: '24px',
                borderImageRepeat: 'stretch',
                borderStyle: 'solid',
              }}
            >
              <div className="bg-[#C4A46C]/90 border-4 border-[#8B6914] px-6 py-3">
                <p className="font-pixel text-sm text-[#3D2817] uppercase">
                  🎵 Comprando Nether + End = Bonus de Música
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment notice */}
        <p className="font-pixel text-xs text-[#5C3010] text-center uppercase">
          Los pagos son procesados de forma segura con Stripe
        </p>
      </div>

      {/* Purchase confirmation modal */}
      <AnimatePresence>
        {showModal && (
          <PurchaseModal
            packageId={showModal}
            onConfirm={handleConfirmPurchase}
            onCancel={() => setShowModal(null)}
            isLoading={isCheckingOut}
            needsLogin={!isSignedIn}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}