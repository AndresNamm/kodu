import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Only Stitch images for this game
const STITCH_COUNT = 40;
const stitchImages: string[] = Array.from({ length: STITCH_COUNT }, (_, index) => 
  `/downloads/stitch/stitch-${String(index + 1).padStart(2, '0')}.jpg`
);

// Shuffle bag to ensure we show all images before repeating
let availableImages: string[] = [];

const getRandomStitchImage = (): string => {
  if (stitchImages.length === 0) {
    return '/otter.jpg'; // Fallback
  }

  if (availableImages.length === 0) {
    // Refill and shuffle
    availableImages = [...stitchImages];
    // Fisher-Yates shuffle
    for (let i = availableImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableImages[i], availableImages[j]] = [availableImages[j], availableImages[i]];
    }
  }

  return availableImages.pop() as string;
};

const POPUP_TIMEOUT_MS = 3000;

interface ColorOption {
  name: string;
  hex: string;
}

const COLORS: ColorOption[] = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#2196F3' },
  { name: 'Green', hex: '#4CAF50' },
  { name: 'Yellow', hex: '#FFEB3B' },
  { name: 'Orange', hex: '#FF9800' },
  { name: 'Purple', hex: '#9C27B0' },
  { name: 'Pink', hex: '#E91E63' },
  { name: 'Black', hex: '#000000' },
  { name: 'Brown', hex: '#795548' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#9E9E9E' },
];

function ColorGame(): React.ReactElement {
  const [currentColor, setCurrentColor] = useState<ColorOption>(COLORS[0]);
  const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false);
  const [rewardImage, setRewardImage] = useState<string>('');
  const navigate = useNavigate();
  const popupTimeoutRef = useRef<number | null>(null);

  const generateNewColor = () => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrentColor(nextColor);
  };

  useEffect(() => {
    generateNewColor();
    return () => {
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  const handleCorrect = () => {
    setRewardImage(getRandomStitchImage());
    setShowRewardPopup(true);
    
    popupTimeoutRef.current = window.setTimeout(() => {
      setShowRewardPopup(false);
      generateNewColor();
    }, POPUP_TIMEOUT_MS);
  };

  const handleWrong = () => {
    generateNewColor();
  };

  const buttonStyle = {
    padding: '20px 40px',
    fontSize: '2rem',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transition: 'transform 0.1s',
    minWidth: '200px'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f2f5',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      >
        Back
      </button>

      <h1 style={{ fontSize: '3rem', marginTop: '60px', marginBottom: '20px', color: '#333' }}>
        What color is this?
      </h1>

      {/* Color Display */}
      <div style={{
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        backgroundColor: currentColor.hex,
        border: '8px solid white',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        marginBottom: '60px',
        transition: 'background-color 0.3s ease'
      }} />

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '40px',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleWrong}
          style={{...buttonStyle, backgroundColor: '#F44336'}} // Red
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Wrong ❌
        </button>

        <button
          onClick={handleCorrect}
          style={{...buttonStyle, backgroundColor: '#4CAF50'}} // Green
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Correct ✅
        </button>
      </div>

      {/* Reward Popup */}
      {showRewardPopup && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s'
        }}>
          <img 
            src={rewardImage} 
            alt="Stitch Reward" 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(255,255,255,0.5)',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          />
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.5); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ColorGame;
