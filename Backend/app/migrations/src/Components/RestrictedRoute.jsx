import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { FadeLoader } from "react-spinners";

const RestrictedRoute = ({isSuperUserAllowed, isStaffAllowed}) => {
    const { isAuthenticated, isLoading, isSuperUser, isStaff } = useAuth();

    if(isLoading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>;
    return (((isSuperUserAllowed && isSuperUser) || (isStaffAllowed && isStaff)) && isAuthenticated && !isLoading) ? <Outlet /> : <Navigate to="/" replace />;
};

export default RestrictedRoute;