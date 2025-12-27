'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface Allergen {
  id: number;
  number: number;
  name: string;
}

interface AllergenBadgeProps {
  allergens: Allergen[];
}

interface TooltipPosition {
  top: number;
  left: number;
  showAbove: boolean;
}

export function AllergenBadge({ allergens }: AllergenBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const calculatePosition = useCallback(() => {
    if (!badgeRef.current) return;

    const badge = badgeRef.current.getBoundingClientRect();
    const tooltipWidth = 200;
    const tooltipHeight = 100; // estimate
    const padding = 8;

    // Calculate horizontal position (center on badge, but keep within screen)
    let left = badge.left + badge.width / 2 - tooltipWidth / 2;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    // Check if tooltip fits above or below
    const spaceAbove = badge.top;
    const spaceBelow = window.innerHeight - badge.bottom;
    const showAbove = spaceAbove > spaceBelow && spaceAbove > tooltipHeight + padding;

    let top: number;
    if (showAbove) {
      top = badge.top - tooltipHeight - padding;
    } else {
      top = badge.bottom + padding;
    }

    setPosition({ top, left, showAbove });
  }, []);

  const openTooltip = useCallback(() => {
    calculatePosition();
    setShowTooltip(true);
  }, [calculatePosition]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      clearTimer();
      longPressTimer.current = setTimeout(() => {
        openTooltip();
      }, 400);
    },
    [clearTimer, openTooltip],
  );

  const handleTouchEnd = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleTouchMove = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleMouseEnter = useCallback(() => {
    openTooltip();
  }, [openTooltip]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  // Adjust position after tooltip renders (to get actual height)
  useEffect(() => {
    if (showTooltip && tooltipRef.current && badgeRef.current && position) {
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const badge = badgeRef.current.getBoundingClientRect();
      const padding = 8;

      let newTop = position.top;
      if (position.showAbove) {
        newTop = badge.top - tooltip.height - padding;
      }

      // Ensure tooltip stays within vertical bounds
      newTop = Math.max(padding, Math.min(newTop, window.innerHeight - tooltip.height - padding));

      if (newTop !== position.top) {
        setPosition((prev) => (prev ? { ...prev, top: newTop } : null));
      }
    }
  }, [showTooltip, position]);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  if (!allergens || allergens.length === 0) {
    return null;
  }

  // Sort allergens by number
  const sortedAllergens = [...allergens].sort((a, b) => a.number - b.number);

  return (
    <span
      ref={badgeRef}
      className="allergen-badge"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <sup className="allergen-numbers">
        {sortedAllergens.map((a, i) => (
          <span key={a.id ?? a.number}>
            {i > 0 && <span className="allergen-separator">,</span>}
            {a.number}
          </span>
        ))}
      </sup>
      {showTooltip &&
        position &&
        createPortal(
          <div ref={tooltipRef} className="allergen-tooltip" style={{ top: position.top, left: position.left }}>
            {sortedAllergens.map((a) => (
              <div key={a.id ?? a.number} className="allergen-tooltip-item">
                <span className="allergen-tooltip-number">{a.number}</span>
                <span className="allergen-tooltip-name">{a.name}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </span>
  );
}
