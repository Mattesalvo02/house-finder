import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../Firebase/firebaseConfig";
import "./EditHousePage.scss";
import { HouseDetails } from "../../Type/HouseDetails";

function EditHousePage() {
  const { id } = useParams<{ id: string }>();
  const [houseDetails, setHouseDetails] = useState<HouseDetails | null>(null);
  const [images, setImages] = useState<File[]>([]); // stato per gestire le nuove immagini caricate
  const [existingImgUrls, setExistingImgUrls] = useState<string[]>([]); // stato per memorizzare le url delle immagini
  const [error, setError] = useState<string | null>(null);
  const database = getDatabase(app);
  const storage = getStorage(app);
  const navigate = useNavigate();

  // carico i dettagli della casa dal database
  useEffect(() => {
    const fetchHouse = async () => {
      if (id) {
        try {
          const houseRef = ref(database, `houses/${id}`);
          const snapshot = await get(houseRef);
          if (snapshot.exists()) {
            // se i dettagli della casa esistono, li salvo nello stato
            const houseData = snapshot.val();
            setHouseDetails(houseData);
            setExistingImgUrls(houseData.imgUrls || []);
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

  // gestisco i cambiamenti nel form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setHouseDetails((prevDetails) => ({
      ...prevDetails!,
      [name]: value,
    }));
  };

  // gestisco caricamento di nuove immagini
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
    }
  };

  // gestisco l'eliminazione delle immagini esistenti
  const handleImageDelete = (index: number) => {
    setExistingImgUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  // gestisco l'invio del modulo e l'aggiornamento dei dettagli
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!houseDetails) {
      setError("House details not loaded.");
      return;
    }

    try {
      // inizializzo le url aggiornate con le immagini gia esistenti
      let updatedImgUrls = [...existingImgUrls];

      // se ci sono nuove immagini caricate, le carico su Firebase Storage e ne ottengo le url
      if (images.length > 0) {
        const uploadPromises = images.map(async (image) => {
          const imageRef = storageRef(storage, `houseImages/${image.name}`);
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        });
        const newImgUrls = await Promise.all(uploadPromises);
        updatedImgUrls = [...existingImgUrls, ...newImgUrls];
      }

      // aggiorno dettagli della casa con le nuove informazioni
      const updatedHouseDetails = {
        ...houseDetails,
        imgUrls: updatedImgUrls,
        price: houseDetails.price?.toString() || "",
        bed: houseDetails.bed?.toString() || "",
        bath: houseDetails.bath?.toString() || "",
        zip_code: houseDetails.zip_code?.toString() || "",
        house_size_m2: houseDetails.house_size_m2?.toString() || "",
      };

      // salvo dettagli aggiornati
      const houseRef = ref(database, `houses/${id}`);
      await update(houseRef, updatedHouseDetails);

      navigate(`/houses/${id}`);
    } catch (error) {
      setError("An error occurred while updating the house details.");
      console.error("Error updating house details:", error);
    }
  };

  // mostro un messaggio di caricamento finché dettagli non caricati
  if (!houseDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="edit-page-container">
        <div className="edit-page-header">
          <div className="header-title">Edit House</div>
          <div className="underline"></div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {existingImgUrls.length > 0 && (
            <div className="existing-images">
              {existingImgUrls.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`House ${index + 1}`} />
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleImageDelete(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="input-group">
            <i className="icon fa fa-home" />
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={houseDetails.title}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-images" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-file-alt" />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={houseDetails.description}
              onChange={handleChange}
            />
          </div>

          <div className="input-group flex items-center space-x-3">
            <select
              name="status"
              value={houseDetails.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Status</option>
              <option value="for sale">For Sale</option>
              <option value="for rent">For Rent</option>
            </select>
          </div>

          <div className="input-group">
            <i className="icon fa fa-dollar-sign" />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={houseDetails.price || ""}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-bed" />
            <input
              type="number"
              name="bed"
              placeholder="Number of Beds"
              value={houseDetails.bed || ""}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-bath" />
            <input
              type="number"
              name="bath"
              placeholder="Number of Baths"
              value={houseDetails.bath || ""}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-road" />
            <input
              type="text"
              name="street"
              placeholder="Street"
              value={houseDetails.street}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-city" />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={houseDetails.city}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-map-marker-alt" />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={houseDetails.state}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-mail-bulk" />
            <input
              type="number"
              name="zip_code"
              placeholder="Zip Code"
              value={houseDetails.zip_code || ""}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-ruler-combined" />
            <input
              type="number"
              name="house_size_m2"
              placeholder="House Size (m²)"
              value={houseDetails.house_size_m2 || ""}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="buttons-container">
            <button type="submit" className="signup-button">
              Update House
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditHousePage;
