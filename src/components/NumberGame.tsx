import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NumberGame(): React.ReactElement {
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const navigate = useNavigate();

  const goLeft = (): void => {
    setCurrentNumber(prev => prev > 1 ? prev - 1 : 10);
  };

  const goRight = (): void => {
    setCurrentNumber(prev => prev < 10 ? prev + 1 : 1);
  };

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
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              border: '2px solid #45a049',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
    </div>
  );
}

export default NumberGame;