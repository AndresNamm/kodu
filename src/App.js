import React, { useState, useEffect } from 'react';

function App() {
  const [currentNumber, setCurrentNumber] = useState(1);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        setCurrentNumber(prev => prev > 1 ? prev - 1 : 10);
      } else if (event.key === 'ArrowRight') {
        setCurrentNumber(prev => prev < 10 ? prev + 1 : 1);
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
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '4rem', margin: '0', color: '#333' }}>
          {currentNumber}
        </h1>
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
        Use ← → arrow keys to change numbers (1-10)
      </div>
    </div>
  );
}

export default App;