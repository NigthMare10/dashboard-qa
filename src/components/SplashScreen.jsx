import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Total duration: 7.5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 800); // 800ms fade out transition
    }, 7500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">
          <h1>TECHLINE</h1>
          <h2>CONTACT CENTER</h2>
        </div>
        
        <div className="splash-divider"></div>
        
        <div className="splash-dept">
          <span className="scrolling-text">Departamento de Calidad</span>
        </div>
        
        <div className="splash-loader">
          <div className="splash-progress"></div>
        </div>
        
        <div className="splash-status">Inicializando Dashboard en Tiempo Real...</div>
      </div>
      
      {/* Decorative neon background elements */}
      <div className="neon-blob blob-1"></div>
      <div className="neon-blob blob-2"></div>
      <div className="neon-blob blob-3"></div>
    </div>
  );
}
