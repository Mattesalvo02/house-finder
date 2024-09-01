import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import { app } from "../../Firebase/firebaseConfig";
import "./AddHousePage.scss";

type HouseDetails = {
  title: string;
  imgUrls: string[];
  description: string;
  status: string;
  price?: number;
  bed?: number;
  bath?: number;
  street: string;
  city: string;
  state: string;
  zip_code?: number;
  house_size_m2?: number;
  userId: string;
  username: string;
};

function AddHousePage() {
  // stato per dettagli casa
  const [houseDetails, setHouseDetails] = useState<HouseDetails>({
    title: "",
    imgUrls: [],
    description: "",
    status: "",
    price: undefined,
    bed: undefined,
    bath: undefined,
    street: "",
    city: "",
    state: "",
    zip_code: undefined,
    house_size_m2: undefined,
    userId: "",
    username: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const navigate = useNavigate();
  const database = getDatabase(app);

  // rendo utilizzabile la pagina solo dopo l'accesso
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUsername(user.displayName || ""); // ottengo il nome utente dall'oggetto user
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // gestisco i cambiamenti dei campi di input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setHouseDetails({
      ...houseDetails,
      [name]: value,
    });
  };

  // gestisco cambiamento delle immagini caricate
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
    }
  };

  // gestisco invio del modulo
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // verifico i campi obbligatori
    if (
      !houseDetails.title ||
      !houseDetails.description ||
      !houseDetails.status ||
      houseDetails.price === undefined ||
      houseDetails.bed === undefined ||
      houseDetails.bath === undefined ||
      !houseDetails.street ||
      !houseDetails.city ||
      !houseDetails.state ||
      houseDetails.zip_code === undefined ||
      houseDetails.house_size_m2 === undefined ||
      (images.length === 0 && houseDetails.imgUrls.length === 0)
    ) {
      setError("All the information are required.");
      return;
    }

    try {
      if (!userId || !username) {
        // verifico che username esista
        setError("User is not authenticated.");
        return;
      }

      if (images.length > 0) {
        const storage = getStorage();
        const uploadPromises = images.map(async (image) => {
          const imageRef = ref(storage, `houseImages/${image.name}`);
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        });
        houseDetails.imgUrls = await Promise.all(uploadPromises);
      }

      houseDetails.userId = userId;
      houseDetails.username = username;

      // converto i numeri in stringhe
      const houseData = {
        ...houseDetails,
        price: houseDetails.price?.toString() || "",
        bed: houseDetails.bed?.toString() || "",
        bath: houseDetails.bath?.toString() || "",
        zip_code: houseDetails.zip_code?.toString() || "",
        house_size_m2: houseDetails.house_size_m2?.toString() || "",
      };

      console.log("Submitting House Details:", houseData);

      // aggiungo la nuova casa al database con una chiave unica
      const newHouseRef = dbRef(database, `houses/${Date.now()}`);
      await set(newHouseRef, houseData);

      console.log("House Details Submitted:", houseData);

      navigate("/houses");
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("An error occurred while saving the house details.");
    }
  };

  // trasformo valori undefined in stringhe vuote per la visualizzazione negli input
  const handleValue = (value: number | undefined) =>
    value !== undefined ? value : "";

  return (
    <div className="container">
      <div className="sign-page-container">
        <div className="sign-page-header">
          <div className="header-title">Add New House</div>
          <div className="underline"></div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="form-container">
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
              value={handleValue(houseDetails.price)}
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
              value={handleValue(houseDetails.bed)}
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
              value={handleValue(houseDetails.bath)}
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
              value={handleValue(houseDetails.zip_code)}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-ruler-combined" />
            <input
              type="number"
              name="house_size_m2"
              placeholder="House Size (m²)"
              value={handleValue(houseDetails.house_size_m2)}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="buttons-container">
            <button type="submit" className="signup-button">
              Add House
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHousePage;
