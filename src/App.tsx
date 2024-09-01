import { Outlet } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import "./App.scss";
import { useAuth } from './Stores/AuthContext';
import { listenForMessages } from './Components/NotificationServer/NotificationServer';
import { useEffect } from 'react';

function App() {

  // hook per recuperare utente
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: () => void;

    if (user) {
      // chiamo la funzione di ascolto delle notifiche
      unsubscribe = listenForMessages(user.uid);
    }

    // pulizia quando l'utente cambia
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return (
    <div className="layout">
      <Navbar />
      <div className="content">
        {/* inserisco routing */}
        <Outlet />
      </div>
    </div>
  );
}

export default App;
