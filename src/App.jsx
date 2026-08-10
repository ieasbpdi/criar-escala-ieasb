import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EscalasWizard } from './components/EscalasWizard';
import { LoginPage } from './components/LoginPage';
import { UserManagementModal } from './components/UserManagementModal';
import { BirthdaysModal } from './components/BirthdaysModal';
import { initPushNotifications } from './utils/pushNotifications';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ieasb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isBirthdaysModalOpen, setIsBirthdaysModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Inicia o processo de push notification assim que logado
      initPushNotifications();
    }
  }, [currentUser]);

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('ieasb_user', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ieasb_user');
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
        onOpenBirthdaysModal={() => setIsBirthdaysModalOpen(true)}
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

      <BirthdaysModal
        isOpen={isBirthdaysModalOpen}
        onClose={() => setIsBirthdaysModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default App;
