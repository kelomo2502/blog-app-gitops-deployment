import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { JSX } from "react";

const AuthRedirectRoute = ({ element }: { element: JSX.Element }) => {
    const { user } = useAuth();
    return user ? <Navigate to="/" /> : element;
  };

  export default AuthRedirectRoute