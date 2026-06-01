import React from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';
import { useNavigate } from 'react-router-dom';

interface StoneButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  animate?: boolean;
  soundType?: 'menu' | 'equip' | 'back';
}

export function StoneButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  animate = true,
  soundType = 'menu',
}: StoneButtonProps) {
  const navigate = useNavigate();
  const { playButtonClick, playLocked, playEquip, playBack } = useAudio();

  const playSound = () => {
    switch (soundType) {
      case 'equip':
        playEquip();
        break;
      case 'back':
        playBack();
        break;
      case 'menu':
      default:
        playButtonClick();
        break;
    }
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-b from-mc-stone to-mc-stoneDark
      border-mc-stoneDark text-mc-textLight
      hover:from-mc-stoneDark hover:to-mc-stone
      active:from-mc-stoneDark
    `,
    secondary: `
      bg-gradient-to-b from-mc-wood to-mc-woodDark
      border-mc-woodDark text-mc-textLight
      hover:from-mc-woodDark hover:to-mc-wood
    `,
    danger: `
      bg-gradient-to-b from-red-700 to-red-900
      border-red-900 text-white
      hover:from-red-800 hover:to-red-950
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-pixel uppercase tracking-wider',
    md: 'px-6 py-3 text-sm font-pixel uppercase tracking-wider',
    lg: 'px-8 py-4 text-base font-pixel uppercase tracking-wider',
  };

  const baseClasses = `
    relative
    border-4 border-t-8 border-b-4 border-l-4 border-r-4
    font-pixel
    shadow-stone
    transition-all duration-100
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  const handleClick = () => {
    if (disabled) {
      playLocked();
      return;
    }
    playSound();
    if (href) {
      navigate(href);
    } else if (onClick) {
      onClick();
    }
  };

  const buttonContent = (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );

  if (animate) {
    return (
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.98, y: 0 }}
        className={baseClasses}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button onClick={handleClick} disabled={disabled} className={baseClasses}>
      {buttonContent}
    </button>
  );
}