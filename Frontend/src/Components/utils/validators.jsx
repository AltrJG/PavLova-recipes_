import validator from "validator";
import DOMPurify from 'dompurify';

// Validacion del cambio de informacion personal
export const validateUserData = (userData) => {
    let errors = {};

    if (validator.isEmpty(userData.nombre)) {
        errors.nombre = "El nombre no puede estar vacío";
    }

    const sanitizedName = DOMPurify.sanitize(userData.nombre);
        
    if (sanitizedName !== userData.nombre) {
        errors.nombre = "El contenido del nombre contiene código no permitido.";
    }

    if (userData.facebook_link && (!validator.isURL(userData.facebook_link, { require_protocol: true }) || !/^(https?:\/\/)?(www\.)?facebook\.com\//.test(userData.facebook_link))) {
        errors.facebook_link = "El Enlace a facebook no es válida";
    }
    
    if (userData.twitter_link && (!validator.isURL(userData.twitter_link, { require_protocol: true }) || !/^(https?:\/\/)?(www\.)?x\.com\//.test(userData.twitter_link))) {
        errors.twitter_link = "El Enlace a X no es válida";
    }

    if (userData.youtube_link && (!validator.isURL(userData.youtube_link, { require_protocol: true }) || !/^(https?:\/\/)?(www\.)?youtube\.com\//.test(userData.youtube_link))) {
        errors.youtube_link = "El Enlace a youtube no es válido";
    }

    if (userData.about_me) {
        // Check if input contains potential malicious code
        const sanitizedAboutMe = DOMPurify.sanitize(userData.about_me);
        
        if (sanitizedAboutMe !== userData.about_me) {
            errors.about_me = "El contenido de 'Sobre mí' contiene código no permitido.";
        }
    }

    const sanitizedCountry = DOMPurify.sanitize(userData.pais);
        
    if (sanitizedCountry !== userData.pais) {
        errors.pais = "El contenido del pais contiene código no permitido.";
    }

    return errors;
};

// Validacion del cambio de contraseña
export const validatePasswordData = (passwordData) => {
    let errors = {};

    if (!validator.isStrongPassword(passwordData.newPassword, { minLength: 8 })) {
        errors.newPassword = "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, un simbolo y un número.";
    }

    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
        errors.newPasswordConfirm = "Las contraseñas no coinciden";
    }

    return errors;
};

// Validacion del cambio de email
export const validateMailData = (mailData) => {
    let errors = {};

    const safeEmail = DOMPurify.sanitize(mailData.correo);
    if(safeEmail != mailData.correo){
        errors.correo = 'El correo tiene codigo no permitido';
    }
    if (!validator.isEmail(mailData.correo)) {
        errors.correo = "Correo no válido";
    }

    if (validator.isEmpty(mailData.password)) {
        errors.password = "Debes ingresar la contraseña actual";
    }

    return errors;

};

export const validateLoginForm = (loginData) => {
    let errors = {};

    // Sanitize email
    const cleanEmail = DOMPurify.sanitize(loginData.correo);

    if(validator.isEmpty(cleanEmail)){
        errors.correo = "El correo electrónico no puede ir vacio";
    }
    
    if (!validator.isEmail(cleanEmail)) {
        errors.correo = "El correo electrónico no es válido";
    }

    // Check if password is empty
    if (validator.isEmpty(loginData.password)) {
        errors.password = "La contraseña no puede estar vacía";
    }

    return errors;
};

export const validateAccountRecover = (recoverData) => {
    let errors = {};

    // Sanitize email
    const cleanEmail = DOMPurify.sanitize(recoverData.correo);

    if(validator.isEmpty(cleanEmail)){
        errors.correo = "El correo electrónico no puede ir vacio";
    }
    
    if (!validator.isEmail(cleanEmail)) {
        errors.correo = "El correo electrónico no es válido";
    }

    return errors;
};

// Validacion del cambio de informacion personal
export const validateRegister = (userData) => {
    let errors = {};

    if (validator.isEmpty(userData.nombre)) {
        errors.nombre = "El nombre no puede estar vacío";
    }

    const sanitizedName = DOMPurify.sanitize(userData.nombre);
        
    if (sanitizedName !== userData.nombre) {
        errors.nombre = "El contenido del nombre contiene código no permitido.";
    }

    // Sanitize email
    const cleanEmail = DOMPurify.sanitize(userData.correo);

    if(validator.isEmpty(cleanEmail)){
        errors.correo = "El correo electrónico no puede ir vacio";
    }
    
    if (!validator.isEmail(cleanEmail)) {
        errors.correo = "El correo electrónico no es válido";
    }

    // Check if password is empty
    if (validator.isEmpty(userData.password)) {
        errors.password = "La contraseña no puede estar vacía";
    }

    if (userData.password !== userData.confirmPassword) {
        errors.newPasswordConfirm = "Las contraseñas no coinciden";
    }

    if (!validator.isStrongPassword(userData.password, { minLength: 8 })) {
        errors.newPassword = "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, un simbolo y un número.";
    }

    return errors;
};