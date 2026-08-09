import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hub } from './components/Hub';
import { EscalasWizard } from './components/EscalasWizard';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <main>
        {currentTool === null && <Hub onSelectTool={setCurrentTool} />}
        {currentTool === 'escalas' && <EscalasWizard onBack={() => setCurrentTool(null)} />}
      </main>
    </div>
  );
}

export default App;
