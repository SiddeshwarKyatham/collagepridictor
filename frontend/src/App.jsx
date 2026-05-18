import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import PredictorResults from './pages/PredictorResults';
import CollegeDetail from './pages/CollegeDetail';
import Colleges from './pages/Colleges';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/results" element={<PredictorResults />} />
      <Route path="/colleges" element={<Colleges />} />
      <Route path="/colleges/:code" element={<CollegeDetail />} />
    </Routes>
  );
}

export default App;
