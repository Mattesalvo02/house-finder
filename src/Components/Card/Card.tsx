import React from "react";
import "./Card.scss";

interface CardProps {
  title: string;
  imgUrl: string;
  status: string;
  price: number;
  city: string;
}

const Card: React.FC<CardProps> = ({ title, imgUrl, status, price, city }) => {
  return (
    <div className="card">
      <div className="card-image">
        <img src={imgUrl} alt={title} />
      </div>
      <div className="card-content">
        <h2>{title}</h2>
        <div className="card-info">
          <p className="card-status">{status}</p>
          <p className="card-city">{city}</p>
          <p className="card-price">{price.toLocaleString()}€</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
