import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { app } from "../../Firebase/firebaseConfig";
import { useAuth } from "../../Stores/AuthContext";
import { v4 as uuidv4 } from "uuid";
import "./ChatPage.scss";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Message {
  id: string;
  from: string;
  to: string | undefined;
  text: string;
  timestamp: number;
}

function ChatPage() {
  // prendo l'id della chat dal url
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientNickname, setRecipientNickname] = useState<string>(""); // stato usato per mantenere il nickname del destinatario
  const database = getDatabase(app);

  // verifico che l'utente sia autentificato
  useEffect(() => {
    const auth = getAuth();
    // se l'utente fa log out vado alla pagina di login
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    // pulizia
    return () => unsubscribe();
  }, [navigate]);

  // recupero messaggi della chat dal db
  useEffect(() => {
    if (user && chatId) {
      const chatRef = ref(database, `chats/${chatId}`);

      const unsubscribe = onValue(
        chatRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const chatData = snapshot.val() as {
              messages: { [key: string]: Message };
            };
            setMessages(Object.values(chatData.messages));
          } else {
            setMessages([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching chat data:", error);
          setLoading(false);
        }
      );

      // pulizia
      return () => unsubscribe();
    }
  }, [user, chatId, database]);

  // recupero il nickname del destinatario
  useEffect(() => {
    if (user && chatId) {
      // prendo dall'id della chat solo quello che non è dell'utente che ha effettuato l'accesso
      const recipientId = chatId.split("&").find((id) => id !== user.uid);

      if (recipientId) {
        const recipientRef = ref(database, `users/${recipientId}/nickname`);

        // prendo nickname associato a quell'id
        onValue(
          recipientRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setRecipientNickname(snapshot.val());
            } else {
              setRecipientNickname("User");
            }
          },
          (error) => {
            console.error("Error fetching recipient nickname:", error);
            setRecipientNickname("User");
          }
        );
      }
    }
  }, [user, chatId, database]);

  // invio messaggio
  const sendMessage = async () => {
    if (message.trim() !== "" && user && chatId) {
      const chatRef = ref(database, `chats/${chatId}/messages`);
      // compilo i campi del messaggio
      const newMessage: Message = {
        id: uuidv4(),
        from: user.uid,
        to: chatId.split("&").find((id) => id !== user.uid),
        text: message,
        timestamp: Date.now(),
      };

      try {
        // aggiungo messaggio al db
        await push(chatRef, newMessage);
        // pulisco campo di input dopo l'invio
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="chat-page">
      <h2>Chat with {recipientNickname}</h2>
      <div className="chat-container">
        <div className="chat-messages">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.from === user?.uid ? "sent" : "received"
                }`}
              >
                <strong>
                  {msg.from === user?.uid ? "me:" : `${recipientNickname}:`}
                </strong>
                {msg.text}
                <em>
                  {" "}
                  {new Date(msg.timestamp).toLocaleDateString()}{" "}
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </em>
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
