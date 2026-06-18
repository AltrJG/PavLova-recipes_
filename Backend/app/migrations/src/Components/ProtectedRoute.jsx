import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { FadeLoader } from "react-spinners";

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if(isLoading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>;
    return (isAuthenticated && !isLoading) ? <Outlet /> : <Navigate to="/auth/iniciar-sesion" replace />;
};

export default ProtectedRoute;