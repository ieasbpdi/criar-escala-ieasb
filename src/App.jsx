import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EscalasWizard } from './components/EscalasWizard';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Toggle Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <main className="flex-grow">
        <EscalasWizard />
      </main>

      <Footer />
    </div>
  );
}

export default App;
