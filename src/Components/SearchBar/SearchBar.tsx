import React, { useState } from "react";
import "./SearchBar.scss";

// proprietà di SearchBar
interface SearchBarProps {
  // funzione di SearchBar
  onSearch: (filters: {
    location: string;
    status: string;
    minPrice: number;
    maxPrice: number;
  }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // funzione per gestire la ricerca
  const handleSearch = () => {
    // chiamo funzione passando i valori
    onSearch({
      location,
      status,
      minPrice: minPrice !== "" ? minPrice : 0,
      maxPrice: maxPrice !== "" ? maxPrice : Number.MAX_VALUE,
    });
  };

  // eseguo la ricerca anche quando viene premuto invio
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Status</option>
        <option value="for sale">For Sale</option>
        <option value="for rent">For Rent</option>
      </select>
      <input
        type="number"
        placeholder="Min Price"
        value={minPrice}
        onChange={(e) =>
          setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
        }
        onKeyDown={handleKeyDown}
      />
      <input
        type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) =>
          setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
        }
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
