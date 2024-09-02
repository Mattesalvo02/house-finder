import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../Firebase/firebaseConfig"; // Assicurati che questo percorso sia corretto
import Card from "../../Components/Card/Card"; // Assicurati che il percorso sia corretto
import SearchBar from "../../Components/SearchBar/SearchBar"; // Assicurati che il percorso sia corretto
import { Link } from "react-router-dom";
import "./CardsPage.scss";

type HouseDetails = {
  id: string;
  title: string;
  imgUrls: string[];
  description: string;
  status: string;
  price?: string;
  bed?: string;
  bath?: string;
  street: string;
  city: string;
  state: string;
  zip_code?: string;
  house_size_m2?: string;
  userId: string;
};

const CardsPage = () => {
  const [houses, setHouses] = useState<HouseDetails[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<HouseDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const database = getDatabase(app);

  useEffect(() => {
    const housesRef = ref(database, "houses");
    const unsubscribe = onValue(
      housesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const housesArray = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          setHouses(housesArray);
          setFilteredHouses(housesArray);
        } else {
          setHouses([]);
          setFilteredHouses([]);
        }
      },
      (error) => {
        setError("Failed to fetch houses.");
        console.error("Error fetching houses:", error);
      }
    );

    return () => unsubscribe();
  }, [database]);

  const handleSearch = (filters: {
    location: string;
    status: string;
    minPrice: number;
    maxPrice: number;
  }) => {
    const filtered = houses.filter((house) => {
      const locationFilter = filters.location.toLowerCase();
      const matchesLocation = locationFilter
        ? house.city.toLowerCase() === locationFilter
        : true;
      const matchesStatus = filters.status
        ? house.status === filters.status
        : true;
      const matchesPrice =
        house.price !== undefined &&
        Number(house.price) >= filters.minPrice &&
        Number(house.price) <= filters.maxPrice;

      return matchesLocation && matchesStatus && matchesPrice;
    });

    setFilteredHouses(filtered);
  };

  return (
    <div className="cards-page">
      <SearchBar onSearch={handleSearch} />
      <h1 className="page-title">Available Houses</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="cards-container">
        {filteredHouses.length > 0 ? (
          filteredHouses.map((house) => (
            <Link to={`/houses/${house.id}`} key={house.id}>
              <Card
                title={house.title}
                imgUrl={house.imgUrls[0]}
                status={house.status}
                city={house.city}
                price={house.price ? Number(house.price) : 0}
              />
            </Link>
          ))
        ) : (
          <p>No houses available.</p>
        )}
      </div>
    </div>
  );
};

export default CardsPage;
