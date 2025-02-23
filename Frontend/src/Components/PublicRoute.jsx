import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const PublicRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if(isLoading) return "cargando...";
    return (!isAuthenticated && !isLoading) ? <Outlet /> : <Navigate to="/users" replace />;
};

export default PublicRoute;