import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, remove } from "firebase/database";
import { app } from "../../Firebase/firebaseConfig";
import { useAuth } from "../../Stores/AuthContext";
import "./CardDetailPage.scss";
import { HouseDetails } from "../../Type/HouseDetails";

function CardDetailPage() {
  const { id } = useParams<{ id: string }>(); // prendo l'id dal parametro del url
  const { user } = useAuth();
  const [house, setHouse] = useState<HouseDetails | null>(null); // stato per dettagli della casa
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0); // stato per tenere traccia dell'immagine attualmente visualizzata
  const database = getDatabase(app);
  const navigate = useNavigate();

  // effettuo il caricamento dei dettagli della casa
  useEffect(() => {
    const fetchHouse = async () => {
      if (id) {
        try {
          const houseRef = ref(database, `houses/${id}`);
          const snapshot = await get(houseRef);
          if (snapshot.exists()) {
            // se i dettagli esistono li salvo nello stato.
            setHouse(snapshot.val());
          } else {
            setError("House not found");
          }
        } catch (error) {
          setError("Failed to fetch house details.");
          console.error("Error fetching house details:", error);
        }
      }
    };

    fetchHouse();
  }, [id, database]);

  // evento di click per l'immagine successiva
  const handleNextImage = () => {
    if (house && house.imgUrls.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === house.imgUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // evento di click per l'immagine precedente
  const handlePrevImage = () => {
    if (house && house.imgUrls.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? house.imgUrls.length - 1 : prevIndex - 1
      );
    }
  };

  // eliminazione della casa dal database
  const handleDelete = async () => {
    if (id) {
      try {
        const houseRef = ref(database, `houses/${id}`);
        await remove(houseRef);
        navigate("/profile");
      } catch (error) {
        setError("Failed to delete house.");
        console.error("Error deleting house:", error);
      }
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!house) {
    return <div>Loading...</div>;
  }

  const contactLink = `/chat/${user?.uid}&${house.userId}`;

  return (
    <div className="card-detail-page">
      <h1>{house.title}</h1>
      {/* visualizzazione delle immagini della casa */}
      <div className="image-gallery">
        {house.imgUrls.length > 1 && (
          <button className="prev-button" onClick={handlePrevImage}>
            &#10094;
          </button>
        )}
        <img
          src={house.imgUrls[currentImageIndex]}
          alt={house.title}
          className="house-image"
        />
        {house.imgUrls.length > 1 && (
          <button className="next-button" onClick={handleNextImage}>
            &#10095;
          </button>
        )}
      </div>

      <div className="details-grid">
        <p>
          <strong>Status:</strong> {house.status}
        </p>
        <p>
          <strong>City:</strong> {house.city}
        </p>
        <p>
          <strong>Price:</strong> {house.price}$
        </p>
        <p>
          <strong>Beds:</strong> {house.bed}
        </p>
        <p>
          <strong>Baths:</strong> {house.bath}
        </p>
        <p>
          <strong>Address:</strong> {house.street}, {house.city}, {house.state},{" "}
          {house.zip_code}
        </p>
        <p>
          <strong>Size:</strong> {house.house_size_m2} m²
        </p>
        <p>
          <strong>Posted by:</strong> {house.userName}
        </p>
      </div>

      {/* sezione per contattare il venditore, visibile solo se l'utente non è il proprietario della casa */}
      {user && user.uid !== house.userId && (
        <div className="contact-seller">
          <Link to={contactLink} className="contact-button">
            Contact {house.userName}
          </Link>
        </div>
      )}

      {/* sezione per modificare o eliminare la casa, visibile solo al proprietario della casa */}
      {user && user.uid === house.userId && (
        <div className="edit-delete-buttons">
          <Link to={`/edit-house/${id}`} className="edit-button">
            Edit
          </Link>
          <button onClick={handleDelete} className="delete-button">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default CardDetailPage;
