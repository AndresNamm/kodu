import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogHackaton(): React.ReactElement {
  const [logsIdentified, setLogsIdentified] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeInterval: NodeJS.Timeout;
    let logInterval: NodeJS.Timeout;
    
    if (isRunning) {
      // Timer interval - updates every second
      timeInterval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      // Log interval - adds a log every 3 seconds
      logInterval = setInterval(() => {
        setLogsIdentified(prev => prev + 1);
      }, 3000);
    }
    
    return () => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      if (logInterval) {
        clearInterval(logInterval);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = (): void => {
    setIsRunning(prev => !prev);
  };

  const handleReset = (): void => {
    setIsRunning(false);
    setTimeElapsed(0);
    setLogsIdentified(0);
  };

  const handleLogIdentified = (): void => {
    setLogsIdentified(prev => prev + 1);
  };

  const buttonStyle = {
    padding: '12px 24px',
    margin: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease'
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

      <h1 style={{
        fontSize: '3rem',
        margin: '20px 0',
        color: '#333',
        textAlign: 'center'
      }}>
        LogHackaton 🔍
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        margin: '20px'
      }}>
        {/* Timer Display */}
        <div style={{
          fontSize: '3.5rem',
          fontFamily: 'monospace',
          color: isRunning ? '#4CAF50' : '#666',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          {formatTime(timeElapsed)}
        </div>
        
        {/* Logs Counter */}
        <div style={{
          fontSize: '2rem',
          color: '#333',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '10px' }}>
            Logs Identified
          </div>
          <div style={{
            fontSize: '3rem',
            color: '#2196F3',
            fontWeight: 'bold',
            background: '#e3f2fd',
            padding: '15px 30px',
            borderRadius: '12px',
            border: '2px solid #2196F3'
          }}>
            {logsIdentified}
          </div>
        </div>
        
        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleStartStop}
            style={{
              ...buttonStyle,
              backgroundColor: isRunning ? '#f44336' : '#4CAF50',
              color: 'white'
            }}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>
          
          <button
            onClick={handleReset}
            style={{
              ...buttonStyle,
              backgroundColor: '#ff9800',
              color: 'white'
            }}
          >
            🔄 Reset
          </button>
          
          <button
            onClick={handleLogIdentified}
            style={{
              ...buttonStyle,
              backgroundColor: '#2196F3',
              color: 'white'
            }}
          >
            ➕ Log Found!
          </button>
        </div>
        
        {/* Stats */}
        {timeElapsed > 0 && (
          <div style={{
            marginTop: '20px',
            fontSize: '1.1rem',
            color: '#666',
            textAlign: 'center'
          }}>
            Rate: {timeElapsed > 0 ? (logsIdentified / (timeElapsed / 60)).toFixed(2) : '0.00'} logs/minute
          </div>
        )}
      </div>
    </div>
  );
}

export default LogHackaton;