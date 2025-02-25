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

export default function ManageUsers(){

    const { isSuperUser } = useAuth();
    const [ users, setUsers ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { updatedUser, disabledUser, resetUserState } = useUpdateData();

    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre..."},
        { type: "text", name: "correo", placeholder: "Filtrar por correo..."},
        { type: "select", name: "tipoUsuario", defaultOption: "Todos", options: ["Todos", "Usuarios", "Moderadores", "Administradores"]}
    ]

    const [ userFilters, setUserFilters ] = useState({
        nombre: "",
        correo: "",
        tipoUsuario: "Todos"
    });

    const getUsers = async (previous = null, next = null) => {
        setLoading(true);
        try{
            const response = await backendAPI(previous != null ? previous.split('app')[1] : (next != null ? next.split('app')[1] : '/users/'));
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            setCount(response.data.count);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setUsers(response.data.results);
        } catch(error){
            console.log(error);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        getUsers();
    }, []);

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
                <FilterForm filterOptions={filterOptions} data={userFilters} setData={setUserFilters}/>
                { loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                :<>
                <div className='usersContent'>
                    { users.map(user => <UserCard key={user.id} user={user} changeUserPermissions={isSuperUser}/>) }
                </div>
                <Pagination
                    action={getUsers}    
                    next={nextPage} 
                    previous={previousPage} 
                    count={count} 
                    currentPage={currentPage} 
                    text="Mostrando usuarios {start}-{end} de {count}" />
                </>}
            </div>
        </>
    )
}