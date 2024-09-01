import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { app } from "../../Firebase/firebaseConfig";
import "./SignPage.scss";
import { getDatabase, ref, set } from "firebase/database";

function SignPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [redirect, setRedirect] = useState(false); // stato per gestire il reindirizzamento
  const navigate = useNavigate(); // hook per la navigazione
  const database = getDatabase(app);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // espressione regolare per la validazione dell'email

  // reindirizzo l'utente alla pagina di login dopo la registrazione
  useEffect(() => {
    if (redirect) {
      navigate("/login");
    }
  }, [redirect, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // validazione campi di input
    if (!email || !password || !confirmPassword || !nickname) {
      setError("Name, email and passwords are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Email address isn't valid.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const auth = getAuth(app);

      // registro nuovo utente su firebase authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // prendo utente appena registrato
      const user = userCredential.user;

      // aggiungo il nickname al profilo
      await updateProfile(user, {
        displayName: nickname,
      });

      // inserisco l'utente anche nel db
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        nickname: nickname,
        email: user.email,
      });

      setRedirect(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="container">
      <div className="sign-page-container">
        <div className="sign-page-header">
          <div className="header-title">Sign Up</div>
          <div className="underline"></div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <form onSubmit={handleSignUp} className="form-container">
          <div className="input-group">
            <i className="icon fa-regular fa-user" />
            <input
              type="text"
              placeholder="Name"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="icon fa-regular fa-envelope" />
            <input
              type="text"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-lock" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="icon fa fa-lock" />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="buttons-container">
            <Link className="login-link" to="/login">
              Login
            </Link>
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignPage;
