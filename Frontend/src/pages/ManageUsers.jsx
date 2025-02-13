import { useState } from 'react';
import styles from './ManageUsers.module.css';
import FilterForm from '../Components/FilterForm';
import Help from '../Components/Help';
import UserCard from '../Components/UserCard';

export default function ManageUsers(){

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

    return(
        <>
            <Help title={"Buscar Personas"} description={"Busca perfiles de otras personas"}/>
            <div className={styles.usersContainer}>
                <FilterForm filterOptions={filterOptions} data={userFilters} setData={setUserFilters}/>
                <div className='usersContent'>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                    <UserCard/>
                </div>
            </div>
        </>
    )
}