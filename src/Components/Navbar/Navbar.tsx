import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../Stores/AuthContext";
import { getAuth } from "firebase/auth";
import { app } from "../../Firebase/firebaseConfig";

function Navbar() {
  const [open, setOpen] = useState(false);  // stato per gestire il menu a tendina
  const { user } = useAuth();

  // chiudo il menu quando la finestra viene ingrandita
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1024 && open) {
        setOpen(false);
      }
    };

    // aggiungo un listener per il ridimensionamento della finestra
    window.addEventListener("resize", handleResize);

    // pulizia
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  // gestisco il logout dell'utente
  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await auth.signOut(); // effettuo il logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav>
      <div className="logo">
        <img src="/logo.png" alt="HouseFinder Logo" />
        HouseFinder
      </div>

      <div className="center">
        <Link to="/">Home</Link>
        <Link to="/houses">HousesList</Link>
        <Link to={user ? "/addHouse" : "/login"}>AddHouse</Link>
        <Link to="/about">About Us</Link>
      </div>

      <div className="right">
        {/* in base a se ho fatto l'accesso visualizzo cose diverse */}
        {user ? (
          <>
            <Link to="/profile" className="profile">
              <FontAwesomeIcon icon={faUser} /> {user.displayName || "Profile"}
            </Link>
            <button className="logout" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login">
              Log In
            </Link>
            <Link to="/signup" className="signup">
              Sign Up
            </Link>
          </>
        )}
        {/* icona menu a tendina */}
        <div className="menuIcon" onClick={() => setOpen((prev) => !prev)}>
          <FontAwesomeIcon icon={faBars} />
        </div>
        <div className={open ? "menu active" : "menu"}>
          <Link to="/">Home</Link>
          <Link to="/houses">HouseList</Link>
          <Link to="/addHouse">AddHouse</Link>
          <Link to="/about">About Us</Link>
          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <button className="logout" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
