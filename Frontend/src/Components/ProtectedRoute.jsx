import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if(isLoading) return "cargando...";
    return (isAuthenticated && !isLoading) ? <Outlet /> : <Navigate to="/auth/iniciar-sesion" replace />;
};

export default ProtectedRoute;