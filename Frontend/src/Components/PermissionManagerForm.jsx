import { useState, useEffect } from 'react';
import Help from './Help';
import styles from './PermissionManagerForm.module.css';
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
import login from '../assets/login_imagen.jpg';
import logo from '../assets/logo.png';
import manzana from '../assets/manzana_test.png';
import utensilios from '../assets/fondo_utensilios_op.png';

export default function PermissionManagerForm(){

    const items = [
        { key: '1', codename: 'login', image: login, nombre: 'EL ADMIN 7' },
        { key: '2', codename: 'manzana', image: manzana, nombre: 'EL ADMIN 6' },
        { key: '3', codename: 'logo', image: logo, nombre: 'EL ADMIN 5' },
        { key: '4', codename: 'utensilios', image: utensilios, nombre: 'EL ADMIN 4' },
        { key: '5', codename: 'logo', image: logo, nombre: 'EL ADMIN 3' },
        { key: '6', codename: 'logo', image: logo, nombre: 'EL ADMIN 2' },
        { key: '7', codename: 'logo', image: logo, nombre: 'EL ADMIN'},
    ];
    const [activeKey, setActiveKey] = useState(1);
    
    return(
        <div className={styles.permissionManagerContainer}>
            <div className={styles.permissionPicker}>
                <RotationalPicker items={items} activeKey={activeKey} setActiveKey={setActiveKey}/>
            </div>
            <div className={styles.permissionDescription}>
                <h3>{ items.find((item) => item.key == activeKey).nombre }</h3>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic possimus mollitia exercitationem, nihil eaque necessitatibus obcaecati sed molestiae incidunt culpa alias veniam optio omnis id, voluptatum, fugit ducimus sit officia.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic possimus mollitia exercitationem, nihil eaque necessitatibus obcaecati sed molestiae incidunt culpa alias veniam optio omnis id, voluptatum, fugit ducimus sit officia.</p>
                <MainButton type="submit" icon="restaurant" iconSize="4" fontSize="3" color="primary" borderRadius="1.5" disabled={false} text={'Cambiar Rol'}/>
            </div>
        </div>
    )
}