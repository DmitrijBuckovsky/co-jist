'use client';

import { Info, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface InfoModalProps {
  children: React.ReactNode;
}

export function InfoModal({ children }: InfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <>
      <button className="info-icon" onClick={() => setIsOpen(true)} aria-label="Nápověda" type="button">
        <Info size={18} />
      </button>

      {isOpen &&
        createPortal(
          <div className="info-modal-overlay" onClick={handleClose}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
              <button className="info-modal-close" onClick={handleClose} aria-label="Zavřít">
                <X size={20} />
              </button>
              <h3 className="info-modal-title">Nápověda</h3>
              <div className="info-modal-content">{children}</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
