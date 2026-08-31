import React from 'react';

function App(): React.ReactElement {
  return (
    <iframe
      title="Laste õppemängud"
      src="/learning-games/index.html"
      allow="fullscreen"
      allowFullScreen
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        border: 0
      }}
    />
  );
}

export default App;