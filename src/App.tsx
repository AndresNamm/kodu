import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import NumberGame from './components/NumberGame';
import LogHackaton from './components/LogHackaton';

function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/number-game" element={<NumberGame />} />
        <Route path="/log-hackaton" element={<LogHackaton />} />
      </Routes>
    </Router>
  );
}

export default App;