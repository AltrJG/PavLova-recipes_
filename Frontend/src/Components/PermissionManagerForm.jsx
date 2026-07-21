import { useState, useEffect } from 'react';
import Help from './Help';
import styles from './RecipePlanPicker.module.css';
import FilterForm from './FilterForm';
import Recipe from './Recipe';
import MainButton from './MainButton';
import OptionButton from './OptionButton';
import Pagination from './Pagination';
import { useAuth } from '../context/AuthProvider';
import { FadeLoader } from 'react-spinners';
import backendAPI from '../api/axiosConfig';
import { Outlet } from 'react-router-dom';
import RotationalPicker from './RotationalPicker';

export default function PermissionManagerForm(){

    
    return(
        <>
            <RotationalPicker/>
        </>
    )
}