import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const downloadCatalog: Record<string, number> = {
  otter: 5,
  peppa: 5,
  stitch: 40,
  mikimouse: 10,
  fish: 10,
  pirate: 10,
};

// Pre-build the list of downloadable celebration images so we can pick one instantly on win.
const rewardImages: string[] = Object.entries(downloadCatalog).flatMap(([folder, count]) => (
  Array.from({ length: count }, (_, index) => `/downloads/${folder}/${folder}-${String(index + 1).padStart(2, '0')}.jpg`)
));

// Shuffle bag to ensure we show all images before repeating
let availableImages: string[] = [];

const getRandomRewardImage = (): string => {
  if (rewardImages.length === 0) {
    return '/otter.jpg';
  }

  if (availableImages.length === 0) {
    // Refill and shuffle
    availableImages = [...rewardImages];
    // Fisher-Yates shuffle
    for (let i = availableImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableImages[i], availableImages[j]] = [availableImages[j], availableImages[i]];
    }
  }

  return availableImages.pop() as string;
};

const POPUP_TIMEOUT_MS = 3000;
const LETTERS = ['A', 'B', 'C', 'I', 'S', 'O'];

function LetterGame(): React.ReactElement {
  const [currentLetter, setCurrentLetter] = useState<string>('A');
  const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false);
  const [rewardImage, setRewardImage] = useState<string>('/otter.jpg');
  const navigate = useNavigate();
  const popupTimeoutRef = useRef<number | null>(null);

  const generateNewLetter = () => {
    const randomIndex = Math.floor(Math.random() * LETTERS.length);
    setCurrentLetter(LETTERS[randomIndex]);
  };

  useEffect(() => {
    generateNewLetter();
    return () => {
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  const handleCorrect = () => {
    setRewardImage(getRandomRewardImage());
    setShowRewardPopup(true);
    
    popupTimeoutRef.current = window.setTimeout(() => {
      setShowRewardPopup(false);
      generateNewLetter();
    }, POPUP_TIMEOUT_MS);
  };

  const handleWrong = () => {
    generateNewLetter();
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
        What letter is this?
      </h1>

      {/* Letter Display */}
      <div style={{
        fontSize: '15rem',
        fontWeight: 'bold',
        color: '#9C27B0', // Purple color for letters
        marginBottom: '60px',
        textShadow: '4px 4px 8px rgba(0,0,0,0.2)'
      }}>
        {currentLetter}
      </div>

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
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%'
          }}>
            <img 
              src={rewardImage} 
              alt="Reward" 
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '20px',
                boxShadow: '0 0 50px rgba(255,255,255,0.2)',
                animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} 
            />
            <h2 style={{
              color: 'white',
              textAlign: 'center',
              fontSize: '4rem',
              marginTop: '20px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              animation: 'slideUp 0.5s ease-out 0.2s backwards'
            }}>
              Great Job! 🎉
            </h2>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default LetterGame;
