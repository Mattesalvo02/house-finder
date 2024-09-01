import { createBrowserRouter, RouterProvider, RouteObject } from "react-router-dom";
import App from "../App";
import HomePage from "../Pages/HomePage/HomePage";
import AboutPage from "../Pages/AboutPage/AboutPage";
import LoginPage from "../Pages/LoginPage/LoginPage";
import SignPage from "../Pages/SignPage/SignPage";
import ProfilePage from "../Pages/ProfilePage/ProfilePage";
import CardsPage from "../Pages/CardsPage/CardsPage";
import AddHousePage from "../Pages/AddHousePage/AddHousePage";
import CardDetailPage from "../Pages/CardDetailPage/CardDetailPage";
import EditHousePage from "../Pages/EditHousePage/EditHousePage";
import FallbackPage from "../Pages/FallbackPage/FallbackPage";
import ChatPage from "../Pages/ChatPage/ChatPage";
import { useEffect, useState, ReactNode, ReactElement } from "react";
import OfflinePage from "../OfflinePage/OfflinePage";

// funzione per il routing
function Routes() {
  // tengo uno stato per capire se sono online
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // aggiungo listener per l'evento
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // pulizia
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // lo faccio per evitare un if in tutte le route
  interface OnlineOnlyRouteProps {
    element: ReactNode;
  }

  // stampo il contenuto solo se l'app è online sennò stampo la pagina di offline
  const OnlineOnlyRoute = ({ element }: OnlineOnlyRouteProps): ReactElement | null => {
    return isOnline ? <>{element}</> : <OfflinePage />;
  };

  // configurazione route
  const routes: RouteObject[] = [
    {
      path: "/",
      element: <App />, // componente principale
      children: [
        // routes figlie
        { path: "", element: <OnlineOnlyRoute element={<HomePage />} /> },
        { path: "about", element: <OnlineOnlyRoute element={<AboutPage />} /> },
        { path: "login", element: <OnlineOnlyRoute element={<LoginPage />} /> },
        { path: "signup", element: <OnlineOnlyRoute element={<SignPage />} /> },
        { path: "profile", element: <OnlineOnlyRoute element={<ProfilePage />} /> },
        { path: "houses", element: <OnlineOnlyRoute element={<CardsPage />} /> },
        { path: "houses/:id", element: <OnlineOnlyRoute element={<CardDetailPage />} /> },
        { path: "addHouse", element: <OnlineOnlyRoute element={<AddHousePage />} /> },
        { path: "edit-house/:id", element: <OnlineOnlyRoute element={<EditHousePage />} /> },
        { path: "chat/:chatId", element: <OnlineOnlyRoute element={<ChatPage />} /> },
        { path: "*", element: <FallbackPage /> }, // route per i path non definiti
      ],
    },
  ];

  // creo il router con le rotte
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default Routes;
