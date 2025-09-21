import React from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome(): React.ReactElement {
  const navigate = useNavigate();

  const buttonStyle = {
    width: '250px',
    height: '80px',
    backgroundColor: '#2196F3',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    margin: '10px',
    transition: 'all 0.3s ease',
    fontWeight: 'bold'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '3.5rem',
        margin: '40px 0',
        color: '#333',
        textAlign: 'center'
      }}>
        Welcome!
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <button
          style={buttonStyle}
          onClick={() => navigate('/number-game')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
        >
          🎮 Number Game
        </button>
        
        <button
          style={buttonStyle}
          onClick={() => navigate('/log-hackaton')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
        >
          🚀 LogHackaton
        </button>

        <button
          style={buttonStyle}
          onClick={() => navigate('/3d-visualization')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
        >
          📊 3D Point Visualization
        </button>
      </div>
    </div>
  );
}

export default Welcome;