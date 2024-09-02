import React, { useState, useEffect } from "react";
import { useAuth } from "../../Stores/AuthContext";
import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import "./ProfilePage.scss";
import defaultProfile from "../../Assets/defaultProfile.png";
import Card from "../../Components/Card/Card";
import { Link } from "react-router-dom";
import { HouseDetails } from "../../types/HouseDetails";

type Chat = {
  chatId: string;
  otherUser: string;
  lastMessage: string;
  lastMessageTimestamp: number;
};

type Message = {
  from: string;
  to: string;
  text: string;
  timestamp: number;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [newPhoto, setNewPhoto] = useState<File | null>(null); // stato nuova foto profilo
  const [uploading, setUploading] = useState<boolean>(false); // stato foto in caricamento
  const [photoURL, setPhotoURL] = useState<string | null>(
    user?.photoURL || null
  );
  const [userHouses, setUserHouses] = useState<HouseDetails[]>([]);
  const [loadingHouses, setLoadingHouses] = useState<boolean>(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [userNicknames, setUserNicknames] = useState<{ [key: string]: string }>(
    {}
  );

  // recupero le case dal database
  useEffect(() => {
    if (user) {
      const fetchUserHouses = async () => {
        try {
          const db = getDatabase();
          const housesRef = dbRef(db, "houses");

          onValue(housesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              // converto i dati delle case da un oggetto a un array
              const housesArray: HouseDetails[] = Object.keys(data).map(
                (key) => ({
                  ...data[key],
                  id: key,
                })
              );
              // filtro le case per ottenere solo quelle elencate dall'utente corrente
              const userHouses = housesArray.filter(
                (house) => house.userId === user.uid
              );
              setUserHouses(userHouses);
            } else {
              setUserHouses([]);
            }
          });
        } catch (error) {
          console.error("Error fetching user houses:", error);
        } finally {
          setLoadingHouses(false);
        }
      };

      fetchUserHouses();
    }
  }, [user]);

  // recupero le conversazioni chat dell'utente dal database
  useEffect(() => {
    if (user) {
      const fetchUserChats = async () => {
        try {
          const db = getDatabase();
          const chatsRef = dbRef(db, "chats");

          onValue(chatsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const chatsArray: Chat[] = Object.keys(data)
                .map((key) => {
                  const chat = data[key];
                  const messages: Message[] = chat.messages || {};
                  // trovo l'ultimo messaggio nella chat
                  const lastMessage = Object.values(messages).sort(
                    (a, b) => b.timestamp - a.timestamp
                  )[0];

                  // determino l'altro utente nella chat
                  const otherUser =
                    lastMessage.from === user.uid
                      ? lastMessage.to
                      : lastMessage.from;

                  // recupero il nickname
                  if (!userNicknames[otherUser]) {
                    const recipientRef = dbRef(
                      db,
                      `users/${otherUser}/nickname`
                    );
                    onValue(recipientRef, (snapshot) => {
                      if (snapshot.exists()) {
                        const nickname = snapshot.val();
                        setUserNicknames((prev) => ({
                          ...prev,
                          [otherUser]: nickname,
                        }));
                      }
                    });
                  }

                  // includo la chat solo se l'utente corrente è un partecipante
                  if (
                    lastMessage.from === user.uid ||
                    lastMessage.to === user.uid
                  ) {
                    return {
                      chatId: key,
                      otherUser: userNicknames[otherUser] || otherUser,
                      lastMessage: lastMessage.text,
                      lastMessageTimestamp: lastMessage.timestamp,
                    };
                  }
                  return null;
                })
                .filter(Boolean) as Chat[];

              setChats(chatsArray);
            } else {
              setChats([]);
            }
          });
        } catch (error) {
          console.error("Error fetching user chats:", error);
        } finally {
          setLoadingChats(false);
        }
      };

      fetchUserChats();
    }
  }, [user, userNicknames]);

  // gestisco la selezione di una nuova foto profilo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhoto(e.target.files[0]);
    }
  };

  // gestisco il caricamento su Firebase Storage
  const handleUpload = async () => {
    if (!newPhoto || !user) return;

    setUploading(true);

    try {
      const auth = getAuth();
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profile_photos/${user.uid}/${newPhoto.name}`
      );
      // carico la nuova foto
      await uploadBytes(storageRef, newPhoto);
      // ottengo l'url della foto caricata
      const photoURL = await getDownloadURL(storageRef);
      // aggiorno il profilo
      await updateProfile(auth.currentUser!, { photoURL });

      setPhotoURL(photoURL);
    } catch (error) {
      console.error("Error uploading photo: ", error);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-page-container">
      <h1>Profile</h1>
      <img src={photoURL || defaultProfile} alt="" className="avatar" />
      <p>Name: {user.displayName}</p>
      <p>Email: {user.email}</p>

      <div className="photo-upload">
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
      </div>

      <div className="my-listings">
        <h2>My Listings</h2>
        {loadingHouses ? (
          <p>Loading...</p>
        ) : userHouses.length > 0 ? (
          <div className="cards-container">
            {userHouses.map((house) => (
              <Link
                key={house.id}
                to={`/houses/${house.id}?user=${user.displayName}`}
              >
                <Card
                  title={house.title}
                  imgUrl={house.imgUrls[0]}
                  status={house.status}
                  city={house.city}
                  price={house.price ? Number(house.price) : 0}
                />
              </Link>
            ))}
          </div>
        ) : (
          <center>
            <p>No listings available.</p>
          </center>
        )}
      </div>

      <center>
        <div className="my-chats">
          <h2>My Chats</h2>
          {loadingChats ? (
            <p>Loading chats...</p>
          ) : chats.length > 0 ? (
            <ul>
              {chats.map((chat) => (
                <li key={chat.chatId}>
                  <Link
                    to={`/chat/${chat.chatId}?user=${user.displayName}`}
                    state={{ sellerName: chat.otherUser }}
                  >
                    <div>
                      <strong>{chat.otherUser}</strong>
                      <p>{chat.lastMessage}</p>
                      <small>
                        {new Date(chat.lastMessageTimestamp).toLocaleString()}
                      </small>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No chats available.</p>
          )}
        </div>
      </center>
    </div>
  );
};

export default ProfilePage;
