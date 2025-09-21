import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NumberGame(): React.ReactElement {
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [clickedCircles, setClickedCircles] = useState<Set<number>>(new Set());
  const [showOtterPopup, setShowOtterPopup] = useState<boolean>(false);
  const navigate = useNavigate();

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
        setShowOtterPopup(true);
        // Hide popup after 3 seconds
        setTimeout(() => {
          setShowOtterPopup(false);
          // Reset clicked circles for next round
          setClickedCircles(new Set());
        }, 3000);
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
        gap: '15px',
        maxWidth: '400px'
      }}>
        {Array.from({ length: currentNumber }, (_, index) => (
          <div
            key={index}
            onClick={() => handleCircleClick(index)}
            style={{
              width: '50px',
              height: '50px',
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
              src="/otter.jpg" 
              alt="Congratulations Otter" 
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