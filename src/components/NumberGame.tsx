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
const CIRCLE_SIZE = 110;

function NumberGame(): React.ReactElement {
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [clickedCircles, setClickedCircles] = useState<Set<number>>(new Set());
  const [showOtterPopup, setShowOtterPopup] = useState<boolean>(false);
  const [rewardImage, setRewardImage] = useState<string>('/otter.jpg');
  const navigate = useNavigate();
  const popupTimeoutRef = useRef<number | null>(null);

  const goLeft = (): void => {
    setCurrentNumber(prev => prev > 1 ? prev - 1 : 10);
  };

  const goRight = (): void => {
    setCurrentNumber(prev => prev < 10 ? prev + 1 : 1);
  };

  const handleCircleClick = (circleIndex: number): void => {
    if (!clickedCircles.has(circleIndex)) {
      const newClickedCircles = new Set(clickedCircles);
      newClickedCircles.add(circleIndex);
      setClickedCircles(newClickedCircles);

      // Check if all circles for current number are clicked
      if (newClickedCircles.size === currentNumber) {
        if (popupTimeoutRef.current) {
          window.clearTimeout(popupTimeoutRef.current);
        }
        setRewardImage(getRandomRewardImage());
        setShowOtterPopup(true);
        popupTimeoutRef.current = window.setTimeout(() => {
          setShowOtterPopup(false);
          setClickedCircles(new Set());
        }, POPUP_TIMEOUT_MS);
      }
    }
  };

  // Reset clicked circles when number changes
  useEffect(() => {
    setClickedCircles(new Set());
  }, [currentNumber]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') {
        goLeft();
      } else if (event.key === 'ArrowRight') {
        goRight();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '2rem',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5'
    }}>
      {/* Home button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        🏠 Home
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        marginBottom: '30px'
      }}>
        <button
          onClick={goLeft}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#2196F3',
            border: 'none',
            color: 'white',
            fontSize: '2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ←
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', margin: '0', color: '#333' }}>
            {currentNumber}
          </h1>
        </div>
        
        <button
          onClick={goRight}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#2196F3',
            border: 'none',
            color: 'white',
            fontSize: '2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          →
        </button>
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '25px',
        maxWidth: '720px'
      }}>
        {Array.from({ length: currentNumber }, (_, index) => (
          <div
            key={index}
            onClick={() => handleCircleClick(index)}
            style={{
              width: `${CIRCLE_SIZE}px`,
              height: `${CIRCLE_SIZE}px`,
              borderRadius: '50%',
              backgroundColor: clickedCircles.has(index) ? '#F44336' : '#4CAF50',
              border: `2px solid ${clickedCircles.has(index) ? '#d32f2f' : '#45a049'}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              cursor: clickedCircles.has(index) ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              transform: clickedCircles.has(index) ? 'scale(0.9)' : 'scale(1)'
            }}
          />
        ))}
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        fontSize: '1.2rem', 
        color: '#666',
        textAlign: 'center'
      }}>
        Use ← → arrow keys or tap the buttons to change numbers (1-10)
      </div>

      {/* Otter Popup */}
      {showOtterPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            maxHeight: '500px'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0', 
              color: '#333',
              fontSize: '1.5rem'
            }}>
              🎉 Congratulations! 🎉
            </h2>
            <img 
              src={rewardImage} 
              alt="Celebration reward" 
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '10px',
                objectFit: 'contain'
              }}
            />
            <p style={{ 
              margin: '15px 0 0 0', 
              color: '#666',
              fontSize: '1rem'
            }}>
              You clicked all the circles!
            </p>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default NumberGame;