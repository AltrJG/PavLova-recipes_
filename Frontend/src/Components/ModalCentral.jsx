import { useState, useEffect } from 'react';
import Help from './Help';
import styles from './ModalCentral.module.css';
import FilterForm from './FilterForm';
import Recipe from './Recipe';
import MainButton from './MainButton';
import OptionButton from './OptionButton';
import Pagination from './Pagination';
import { useAuth } from '../context/AuthProvider';
import { FadeLoader } from 'react-spinners';
import backendAPI from '../api/axiosConfig';
import { Outlet } from 'react-router-dom';
import { useModalCentral } from '../context/ModalCentralProvider';
import PermissionManagerForm from './PermissionManagerForm';

export default function ModalCentral(){

    const {
        isOpen,
        permissionManager,
        closeModalCentral,
    } = useModalCentral();
    
    return(
        <>
            <div className={`${styles.darkenedBack} ${isOpen ? styles.activeDarkenedBack : ""}`}></div>
            <div onClick={() => closeModalCentral()} className={`${styles.rightSidebarClose} ${isOpen ? styles.activeClose : ""}`}>X</div>
            <div className={`${styles.modalCentralContainer} ${isOpen ? styles.activePicker : ""}`}>
                { permissionManager && <PermissionManagerForm/> }
            </div>
        </>
    )
}