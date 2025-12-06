import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import NumberGame from './components/NumberGame';
import ColorGame from './components/ColorGame';
import LetterGame from './components/LetterGame';

function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/number-game" element={<NumberGame />} />
        <Route path="/color-game" element={<ColorGame />} />
        <Route path="/letter-game" element={<LetterGame />} />
      </Routes>
    </Router>
  );
}

export default App;