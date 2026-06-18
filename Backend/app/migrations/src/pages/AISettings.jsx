import { useEffect, useState } from "react";
import FondoPavlova from "../Components/FondoPavlova";
import Help from "../Components/Help";
import MainButton from "../Components/MainButton";
import PreconfiguracionIA from "../Components/PreconfiguracionIA";
import { useRightSidebar } from "../context/RightSidebarProvider";
import styles from './AISettings.module.css';
import { useBackground } from "../context/BackgroundProvider";
import backendAPI from "../api/axiosConfig";
import { useUpdateData } from "../context/UpdateDataProvider";
import { useAuth } from "../context/AuthProvider";
import { FadeLoader } from "react-spinners";
import Swal from "sweetalert2";

export default function AISettings(){

    const { openAiFormSettings } = useRightSidebar();
    const { addPavlorficAero } = useBackground();
    const { refreshAccessToken } = useAuth();
    const { updatedPreset, createdPreset, resetPresetData }= useUpdateData();
    const [ presets, setPresets ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const dummySettings = [
        {
            id: 1,
            title: "Saludable",
            description: "Si quieres elegir una configuracion saludable",
            sodio: 0,
            proteinas: 100,
            carbohidratos: 100,
            grasas_saturadas: 100,
            grasas_insaturadas: 100,
            grasas_trans: 100
        },
        {
            id: 2,
            title: "Alta en proteínas",
            description: "Ideal para quienes buscan aumentar masa muscular",
            sodio: 0,
            proteinas: 150,
            carbohidratos: 80,
            grasas_saturadas: 90,
            grasas_insaturadas: 110,
            grasas_trans: 50
        },
        {
            id: 3,
            title: "Baja en carbohidratos",
            description: "Para dietas bajas en azúcares y almidones",
            sodio: 0,
            proteinas: 110,
            carbohidratos: 40,
            grasas_saturadas: 70,
            grasas_insaturadas: 100,
            grasas_trans: 30
        },
        {
            id: 4,
            title: "Vegana",
            description: "Sin productos de origen animal",
            sodio: 0,
            proteinas: 90,
            carbohidratos: 100,
            grasas_saturadas: 60,
            grasas_insaturadas: 120,
            grasas_trans: 0
        },
        {
            id: 5,
            title: "Alta energía",
            description: "Para quienes necesitan muchas calorías diarias",
            sodio: 0,
            proteinas: 130,
            carbohidratos: 160,
            grasas_saturadas: 130,
            grasas_insaturadas: 110,
            grasas_trans: 70
        },
        {
            id: 6,
            title: "Keto",
            description: "Para dietas cetogénicas con muy bajo consumo de carbohidratos",
            sodio: 0,
            proteinas: 100,
            carbohidratos: 20,
            grasas_saturadas: 110,
            grasas_insaturadas: 140,
            grasas_trans: 10
        }    
    ];

    const getPresets = async () => {
        setLoading(true);
        try{
            const response = await backendAPI.get(`objetivos_ai/`);
            setPresets(response.data.results);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getPresets);
            }
        } finally{
            setLoading(false);
        }
    }

    const openCreateForm = () => {
        openAiFormSettings(null);
    }

    const deletePresetAsk = (nombre, id) => {
        Swal.fire({
            title: "Eliminar Preajuste",
            icon: "question",
            text: `Estas seguro de eliminar la preconfiguracion '${nombre}'`,
            customClass: {
                title: "swal_title",
                icon: "swal_icon",
                htmlContainer: "swal_text",
                confirmButton: "swal_confirm"
            },
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Eliminar",
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
                deletePreset(nombre, id);
            }
        });
    }

    const deletePreset = async (nombre, id) => {
        try{
            await backendAPI.delete(`objetivos_ai/${id}/`);
            Swal.fire({
                icon: "success",
                title: "Eliminado!",
                text: `La preconfiguracion '${nombre}' fue eliminado con exito`,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            let newData = presets.filter(preset => preset.id != id);
            setPresets(newData);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(deletePreset, nombre, id);
            }
        }
    }

    useEffect(() => {
        addPavlorficAero();
        getPresets();
    }, []);

    useEffect(() => {
        if(Object.keys(createdPreset).length > 1){
            setPresets([...presets, createdPreset]);
            resetPresetData();
        }
        if(Object.keys(updatedPreset).length > 1){
            let newData = presets.filter(preset => preset.id != updatedPreset.id);
            newData.push(updatedPreset);
            setPresets(newData);
            resetPresetData();
        }
    }, [updatedPreset, createdPreset]);
    
    if (loading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>

    return(
        <>
            <Help title={"Inteligencia Artificial"} description={"Gestiona las preconfiguraciones"}>
                <MainButton action={openCreateForm} disabled={false} type={'button'} icon={"hardware-chip"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Gestionar IA"}/>
            </Help>
            <div className={`${styles.preconfiguracionesContainer} preconfiguracionesContent`}>
                {presets.map(preconfiguracion => <PreconfiguracionIA deleteAction={deletePresetAsk} editAction={openAiFormSettings} key={preconfiguracion.id} data={preconfiguracion} isDataOnForm={false}/>)}
            </div>
            <div className="mobileSpace"></div>
        </>
    )
}