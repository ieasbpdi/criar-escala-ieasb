import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EscalasWizard } from './components/EscalasWizard';
import { LoginPage } from './components/LoginPage';
import { UserManagementModal } from './components/UserManagementModal';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('ieasb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    sessionStorage.setItem('ieasb_user', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('ieasb_user');
  };

  // Se não estiver logado, exibe primeiramente a tela de Login obrigatória
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Header 
        currentUser={currentUser}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        onOpenUserManagementModal={() => setIsUserManagementModalOpen(true)}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow">
        <EscalasWizard 
          isMembersModalOpen={isMembersModalOpen}
          setIsMembersModalOpen={setIsMembersModalOpen}
        />
      </main>

      <UserManagementModal 
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        currentUser={currentUser}
      />

      <Footer />
    </div>
  );
}

export default App;
