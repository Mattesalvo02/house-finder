import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { app } from "../../Firebase/firebaseConfig";
import "./LoginPage.scss"; // Importa il file SCSS
import { getDatabase, ref, get, set } from "firebase/database";
import { askNotificationPermission } from "../../Components/NotificationServer/NotificationServer";

type Props = {};

const LoginPage = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false); // usata per il redirect della pagina
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const navigate = useNavigate();

  // per andare a home dopo il login
  useEffect(() => {
    if (redirect) {
      navigate("/");
    }
  }, [redirect, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // validazione degli input
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    // verifica la lunghezza minima della password
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);

      // richiedo permesso notifiche solo dopo login
      await askNotificationPermission();

      setRedirect(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const database = getDatabase(app);

    try {
      // eseguo il login con Google utilizzando una schermata popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);

      // controllo se l'utente esiste già
      if (!userSnapshot.exists()) {
        // creo un nuovo utente
        await set(userRef, {
          nickname: user.displayName,
          email: user.email,
        });
      }

      // richiedo permesso delle notifiche dopo il login
      await askNotificationPermission();

      setRedirect(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const auth = getAuth(app);
      // invio email di reset password
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Please check your inbox.");
      setForgotPasswordMode(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-header">
        <div className="header-title">
          {forgotPasswordMode ? "Reset Password" : "Login"}
        </div>
        <div className="underline"></div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {forgotPasswordMode ? (
        <form onSubmit={handleForgotPassword} className="form-container">
          <div className="input-group">
            <i className="icon fa-regular fa-envelope" />
            <input
              type="text"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="buttons-container">
            <button type="submit" className="reset-button">
              Send Reset Email
            </button>
            <button
              type="button"
              className="back-button"
              onClick={() => setForgotPasswordMode(false)}
            >
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="form-container">
          <div className="input-group">
            <i className="icon fa-regular fa-envelope" />
            <input
              type="text"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group password-group">
            <i className="icon fa fa-lock" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className={`show-password fas ${
                showPassword ? "fa-eye-slash" : "fa-eye"
              }`}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <div className="forgot-password">
            Lost password?{" "}
            <span onClick={() => setForgotPasswordMode(true)}>Click here!</span>
          </div>

          <div className="buttons-container">
            <button
              type="button"
              className="google-login-button"
              onClick={handleGoogleLogin}
            >
              Login with Google
            </button>
            <Link className="signup-link" to="/signUp">
              Sign Up
            </Link>
            <button type="submit" className="login-button">
              Access
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginPage;
