import { useEffect, useState } from 'react';
import styles from './ManageUsers.module.css';
import FilterForm from '../Components/FilterForm';
import Help from '../Components/Help';
import UserCard from '../Components/UserCard';
import { useAuth } from '../context/AuthProvider';
import backendAPI from '../api/axiosConfig';
import Pagination from '../Components/Pagination';
import { useUpdateData } from '../context/UpdateDataProvider';
import { FadeLoader } from 'react-spinners';
import { useSearchParams } from 'react-router-dom';
import FondoPavlova from '../Components/FondoPavlova';
import { useBackground } from '../context/BackgroundProvider';
import { useFilters } from '../context/FiltersProvider';

export default function ManageUsers(){

    const [ searchParams ] = useSearchParams();
    const { isSuperUser, refreshAccessToken } = useAuth();
    const { addPavlorficAero } = useBackground();
    const [ users, setUsers ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { updatedUser, disabledUser, resetUserState } = useUpdateData();
    const { userFilters, setUserFilters, userUpdate, setUserUpdate } = useFilters();

    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre..."},
        { type: "text", name: "correo", placeholder: "Filtrar por correo..."},
        { type: "select", name: "tipoUsuario", defaultOption: "Todos", options: ["Todos", "Usuarios", "Moderadores", "Administradores"]}
    ]

    const getUsers = async (previous = null, next = null) => {
        setLoading(true);
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/users/`;

            const params = new URLSearchParams();

            if (userFilters.nombre.trim() && previous == null && next == null) params.append("name", userFilters.nombre);
            if (userFilters.correo.trim() && previous == null && next == null) params.append("email", userFilters.correo);
            if (userFilters.tipoUsuario !== "Todos" && previous == null && next == null) params.append("role", userFilters.tipoUsuario);

            // Append query parameters if they exist
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await backendAPI(url);
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            setCount(response.data.count);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setUsers(response.data.results);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getUsers);
            }
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        addPavlorficAero();
        getUsers();
    }, []);

    useEffect(() => {
        if(userUpdate){
            getUsers();
            setUserUpdate(false);
        }
    }, [userUpdate]);

    useEffect(() => {
        if(Object.keys(updatedUser).length > 0){
            setUsers((prevUsers) => [
                ...prevUsers.filter(user => user.id !== updatedUser.id), // Remove the old user
                updatedUser
            ]);
            resetUserState();
        }

        if(disabledUser != -1){
            getUsers();
            resetUserState();
        }
    }, [updatedUser, disabledUser]);

    return(
        <>
            <Help title={"Buscar Personas"} description={"Busca perfiles de otras personas"}/>
            <div className={styles.usersContainer}>
                <FilterForm setCurrentPage={setCurrentPage} action={getUsers} filterOptions={filterOptions} data={userFilters} setData={setUserFilters}/>
                { loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : users.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron usuarios con los filtros colocados, prueba modificando los filtros</p>
                : <>
                <div className='usersContent'>
                    { users.map(user => <UserCard key={user.id} user={user} changeUserPermissions={isSuperUser}/>) }
                </div>
                <div className='mobileSpace'>
                <Pagination
                    action={getUsers}    
                    next={nextPage} 
                    previous={previousPage} 
                    count={count} 
                    currentPage={currentPage} 
                    text="Mostrando usuarios {start}-{end} de {count}" />
                </div>
                </>}
            </div>
        </>
    )
}