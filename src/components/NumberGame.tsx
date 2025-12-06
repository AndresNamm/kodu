import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const downloadCatalog: Record<string, number> = {
  otter: 5,
  peppa: 5,
  stitch: 40,
  mikimouse: 10,
  fish: 10,
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

function NumberGame(): React.ReactElement {
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [clickedBalls, setClickedBalls] = useState<Set<number>>(new Set());
  const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false);
  const [rewardImage, setRewardImage] = useState<string>('/otter.jpg');
  const navigate = useNavigate();
  const popupTimeoutRef = useRef<number | null>(null);

  const generateNewNumber = () => {
    // Random number between 1 and 10
    const nextNumber = Math.floor(Math.random() * 5) + 1;
    setCurrentNumber(nextNumber);
    setClickedBalls(new Set());
  };

  const handleBallClick = (index: number) => {
    const newClicked = new Set(clickedBalls);
    newClicked.add(index);
    setClickedBalls(newClicked);
  };

  useEffect(() => {
    generateNewNumber();
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
      generateNewNumber();
    }, POPUP_TIMEOUT_MS);
  };

  const handleWrong = () => {
    generateNewNumber();
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
        What number is this?
      </h1>

      {/* Number Display */}
      <div style={{
        fontSize: '12rem',
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: '30px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
      }}>
        {currentNumber}
      </div>

      {/* Balls Display */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        maxWidth: '800px',
        marginBottom: '40px',
        minHeight: '80px' // Reserve space
      }}>
        {Array.from({ length: currentNumber }, (_, index) => (
          <div
            key={index}
            onClick={() => handleBallClick(index)}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: clickedBalls.has(index) ? '#4CAF50' : '#FF9800',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              border: '4px solid white',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.1s',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards',
              animationDelay: `${index * 0.05}s`
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ))}
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
            alt="Reward" 
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

export default NumberGame;