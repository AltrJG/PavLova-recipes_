import { useEffect } from "react"
import { FadeLoader } from "react-spinners"
import backendAPI from "../api/axiosConfig";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";


export default function VerifyEmail(){

    const navigate = useNavigate();
    const { token } = useParams();

    useEffect(() => {
        const verifyEmail = async () => {
            try{
                const response = await backendAPI.post(`verify_email/${token}/`);
                Swal.fire({
                    icon: "success",
                    title: "Informacion Modificada",
                    text: response.data.message,
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
            } catch(error){
                console.log(error);
                Swal.fire({
                    icon: "error",
                    title: "Algo salio mal",
                    text: error.response.data.error,
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
            } finally{
                navigate('/users');
            }
            
        };
        verifyEmail();
    }, [])

    return(
        <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
    )
}