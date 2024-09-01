import { getDatabase, ref, onChildAdded, off, get } from "firebase/database";
import { app } from "../../Firebase/firebaseConfig";

interface Message {
  from: string;
  id: string;
  text: string;
  timestamp: number;
  to: string;
  read: boolean;
}

// chiedo il permesso di inviare notifiche
export async function askNotificationPermission() {
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();

    if (permission === "granted")
      console.log("Permesso per le notifiche concesso.");
    else console.log("Permesso per le notifiche negato.");
  }
}

// mostro notifica con titolo e corpo
export function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// funzione di ascolto messaggi
export function listenForMessages(userId: string): () => void {
  const database = getDatabase(app);
  const chatsRef = ref(database, "chats");

  // salvo timestamp di avvio
  const appStartTime = Date.now();

  const listeners: Array<{ ref: any; callback: (snapshot: any) => void }> = [];

  // callback per l'aggiunta di una nuovo chat
  const handleChatAdded = (snapshot: any) => {
    const chatId: string | null = snapshot.key;

    // controllo che la chat riguardi l'utente autenticato
    if (chatId && chatId.includes(userId)) {
      const messagesRef = ref(database, `chats/${chatId}/messages`);

      // callback per l'aggiunta di un nuovo messaggio
      const handleMessageAdded = async (messageSnapshot: any) => {
        const newMessage: Message = messageSnapshot.val();

        // filtro i messaggi notificabili, voglio solo notifiche di messaggi non letti, arrivati dopo aver effettuato l'accesso e con destinatario il mio id
        if (
          newMessage.to === userId &&
          !newMessage.read &&
          newMessage.timestamp > appStartTime
        ) {
          // prendo le info per la notifica
          const userRef = ref(database, `users/${newMessage.from}`);
          const userSnapshot = await get(userRef);
          const nickname = userSnapshot.exists()
            ? userSnapshot.val().nickname
            : newMessage.from;

          showNotification(`Nuovo messaggio da ${nickname}`, newMessage.text);
        }
      };

      onChildAdded(messagesRef, handleMessageAdded);
      listeners.push({ ref: messagesRef, callback: handleMessageAdded });
    }
  };

  onChildAdded(chatsRef, handleChatAdded);
  listeners.push({ ref: chatsRef, callback: handleChatAdded });

  // funzione di pulizia
  return function cleanup() {
    listeners.forEach(({ ref, callback }) => {
      off(ref, "child_added", callback);
    });
  };
}
