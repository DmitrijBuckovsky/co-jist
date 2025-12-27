'use client';
import { AllergenPreferences } from './AllergenPreferences';
import { User } from 'lucide-react';
import { useState } from 'react';

export function ProfileView() {
  const [showAllergens, setShowAllergens] = useState(false);

  if (showAllergens) {
    return <AllergenPreferences onBack={() => setShowAllergens(false)} />;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} strokeWidth={1.5} />
        </div>
        <h1 className="profile-name">Anonym</h1>
        <p className="profile-subtitle">Nepřihlášený uživatel</p>
      </div>

      <div className="profile-menu">
        <button className="profile-menu-item" onClick={() => setShowAllergens(true)}>
          <span className="profile-menu-icon">!</span>
          <span className="profile-menu-text">Moje alergeny</span>
          <span className="profile-menu-arrow">&rsaquo;</span>
        </button>
      </div>
    </div>
  );
}
