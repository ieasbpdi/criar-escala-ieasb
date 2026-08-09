import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EscalasWizard } from './components/EscalasWizard';

function App() {
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Header onOpenMembersModal={() => setIsMembersModalOpen(true)} />
      
      <main className="flex-grow">
        <EscalasWizard 
          isMembersModalOpen={isMembersModalOpen}
          setIsMembersModalOpen={setIsMembersModalOpen}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
