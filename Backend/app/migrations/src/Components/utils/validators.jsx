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

    if (passwordData.newPassword != passwordData.newPasswordConfirm) {
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

export const validateUserForm = (data) => {
    const errors = {};

    // Validate role
    const validRoles = ["Usuario", "Moderador", "Administrador"];
    if (!validRoles.includes(data.rol)) {
        errors.rol = "Rol de usuario no válido.";
    }

    // Validate account status
    const validStatuses = ["Activado", "Desactivado"];
    if (!validStatuses.includes(data.activo)) {
        errors.activo = "Estado de cuenta no válido.";
    }

    return errors;
};

export const validateIngredientData = (ingredientData) => {
    let errors = {};

    // Validate 'nombre' (Max 25 characters, sanitized)
    if (!ingredientData.nombre || ingredientData.nombre.trim().length === 0) {
        errors.nombre = "El nombre es obligatorio.";
    } else {
        const sanitizedNombre = DOMPurify.sanitize(ingredientData.nombre.trim());
        if (sanitizedNombre !== ingredientData.nombre) {
            errors.nombre = "El contenido del nombre contiene código no permitido.";
        }
        if (sanitizedNombre.length > 25) {
            errors.nombre = "El nombre no puede tener más de 25 caracteres.";
        }
    }

    // Validate 'consistencia' (Must be either 'Liquido' or 'Solido')
    const validConsistencies = ["Liquido", "Solido"];
    if (!validConsistencies.includes(ingredientData.consistencia)) {
        errors.consistencia = "La consistencia debe ser 'Liquido' o 'Solido'.";
    }

    // Validate numeric fields
    const numericFields = [
        "calorias", "carbohidratos", "proteinas", "grasasSaturadas", 
        "grasasInsaturadas", "grasasTrans", "sodio", "escala_agua"
    ];

    numericFields.forEach(field => {
        if (ingredientData[field] !== undefined) {
            if (!validator.isFloat(ingredientData[field].toString(), { min: 0 })) {
                errors[field] = `El campo ${field} debe ser un número válido.`;
            }
        }
    });

    return errors;
};

export const validateIngredientOptionData = (ingredientOptionData) => {
    let errors = {};

    // Validate 'nombre' (Max 50 characters, sanitized)
    if (!ingredientOptionData.nombre || ingredientOptionData.nombre.trim().length === 0) {
        errors.nombre = "El nombre de porcion es obligatorio.";
    } else {
        const sanitizedNombre = DOMPurify.sanitize(ingredientOptionData.nombre.trim());
        if (sanitizedNombre !== ingredientOptionData.nombre) {
            errors.nombre = "El contenido del nombre contiene código no permitido.";
        }
        if (sanitizedNombre.length > 50) {
            errors.nombre = "El nombre de porcion no puede tener más de 50 caracteres.";
        }
    }

    // Validate numeric fields
    const numericFields = [
        "cantidad",
    ];

    numericFields.forEach(field => {
        if (ingredientOptionData[field] !== undefined) {
            if (!validator.isFloat(ingredientOptionData[field].toString(), { min: 0 })) {
                errors[field] = `El campo ${field} debe ser un número válido.`;
            }
        }
    });

    return errors;
};



export const validateEtiquetaCategoriaData = (categoriaEtiqueta) => {
    let errors = {};

    // Validate 'nombre' (Max 25 characters, sanitized)
    if (!categoriaEtiqueta.nombre || categoriaEtiqueta.nombre.trim().length === 0) {
        errors.nombre = "El nombre es obligatorio.";
    } else {
        const sanitizedNombre = DOMPurify.sanitize(categoriaEtiqueta.nombre.trim());
        if (sanitizedNombre !== categoriaEtiqueta.nombre) {
            errors.nombre = "El contenido del nombre contiene código no permitido.";
        }
        if (sanitizedNombre.length > 25) {
            errors.nombre = "El nombre no puede tener más de 25 caracteres.";
        }
    }

    return errors;
};

export const validateRecetaData = (recetaData) => {
    let errors = {};

    // Validar que los campos tengan texto y no contengan codigo malicioso
    const sanitizedName = DOMPurify.sanitize(recetaData.nombre);
    const sanitizedPhrase = DOMPurify.sanitize(recetaData.frase);
    if(recetaData.nombre !== sanitizedName){
        errors.nombre = "El Nombre contiene codigo no permitido.";
    } else if(recetaData.nombre == ""){
        errors.nombre = "El Nombre no puede ir vacio"
    }
    if(recetaData.frase !== sanitizedPhrase){
        errors.frase = "La frase contiene codigo no permitido.";
    } else if(recetaData.frase == ""){
        errors.frase = "La frase no puede ir vacia."
    }
    // Validar que los tiempos sean validos
    if(isNaN(recetaData.tiempo_preparacion) || recetaData.tiempo_preparacion <= 0){
        errors.tiempo_preparado = "El tiempo de preparado debe ser mayor a 0";
    }
    if(isNaN(recetaData.tiempo_coccion) || recetaData.tiempo_coccion <= 0){
        errors.tiempo_cocinado = "El tiempo de cocinado debe ser mayor a 0";
    }
    if(isNaN(recetaData.porciones) || recetaData.porciones <= 0){
        errors.tiempo_cocinado = "Las porciones debe ser mayor a 0";
    }
    // Validar que se haya seleccionado al menos una categoria y una etiqueta
    if(recetaData.categoria == "" || DOMPurify.sanitize(recetaData.categoria) != recetaData.categoria){
        errors.categoria = "Tienes que escoger una categoria";
    }
    if(recetaData.etiquetas.length == 0){
        errors.etiqueta = "Tienes que escoger al menos una etiqueta";
    }
    // Validar que haya ingredientes y estos tengan valores positivos
    if(Object.keys(recetaData.ingredientes).length == 0){
        errors.ingredientes = "Tienes que colocar al menos un ingrediente";
    } else if(recetaData.ingredientes.some(ingrediente => isNaN(ingrediente.cantidad) || ingrediente.cantidad <= 0)){
        errors.ingredientes = "Todos los ingredientes deben tener una cantidad mayor a 0";
    }
    // Validar que el procedimiento no tenga intentos de inyectado de codigo
    const sanitizedProcedimiento = DOMPurify.sanitize(recetaData.procedimiento);
    if(recetaData.procedimiento !== sanitizedProcedimiento){
        errors.procedimiento = "El Procedimiento contiene codigo no permitido.";
    } else if(!tieneTexto(recetaData.procedimiento)){
        errors.procedimiento = "El Procedimiento no puede ir vacio.";
    }

    return errors;
}

function tieneTexto(textoString){
    try {
        const parsed = JSON.parse(textoString);
        if(parsed[0].type == 'numbered-list' || parsed[0].type == 'bulleted-list'){
            return parsed[0].children?.some(block =>
                block.children?.some(child =>
                    typeof child.text === 'string' && child.text.trim() !== ''
                )
            )
        }
        return parsed.some(block =>
          block.children?.some(child =>
            typeof child.text === 'string' && child.text.trim() !== ''
          )
        );
      } catch (e) {
        return false;
      }
}

export function checkNutritionalObjectives(objectivesData){
    let errors = {};
    Object.keys(objectivesData).forEach(objective => {
        if(isNaN(objectivesData[objective]) || objectivesData[objective] <= 0){
            errors[objective] = `${objective.replace('_', ' ').toUpperCase()} debe ser un numero mayor a 0`;
        }
    });
    return errors;
}

export const validateCommentData = (commentData) => {
    let errors = {};
    const sanitizedContenido = DOMPurify.sanitize(commentData.contenido.trim());
    if (sanitizedContenido !== commentData.contenido) {
        errors.contenido = "El contenido del comentario contiene código no permitido.";
    }
    if(commentData.puntuacion == 0 || isNaN(commentData.puntuacion)){
        errors.puntuacion = "La puntuacion es obligatoria";
    }
    if (!commentData.contenido || commentData.contenido.trim().length === 0) {
        errors.contenido = "El contenido del comentario es obligatorio.";
    }
    return errors;
};

export const validateChangeVisibility = (visibilityData) => {
    let errors = {};
    const validRoles = ["Publica", "Privada"];
    if (!validRoles.includes(visibilityData.visibilidad)) {
        errors.rol = "Esta opcion no es valida.";
    }
    return errors;
}

export const validateAutomaticData = (automaticData) => {
    let errors = {};

    // Validar campos numéricos
    if (isNaN(automaticData.peso) || automaticData.peso <= 0) {
        errors.peso = "El peso debe ser un número mayor a 0.";
    }

    if (isNaN(automaticData.altura) || automaticData.altura <= 0) {
        errors.altura = "La altura debe ser un número mayor a 0.";
    }

    if (isNaN(automaticData.edad) || automaticData.edad <= 0) {
        errors.edad = "La edad debe ser un número mayor a 0.";
    }

    // Validar selects
    const generoOptions = ["Masculino", "Femenino"];
    if (!generoOptions.includes(automaticData.genero)) {
        errors.genero = "El género seleccionado no es válido.";
    }

    const frecuenciaOptions = [
        "Nada",
        "1 dia",
        "2 dias",
        "3 dias",
        "4 dias",
        "5 dias",
        "6 dias",
        "7 dias",
        "Intensivo, todos los dias"
    ];
    if (!frecuenciaOptions.includes(automaticData.frecuencia_ejercicio)) {
        errors.frecuencia_ejercicio = "La frecuencia de ejercicio seleccionada no es válida.";
    }

    return errors;
};

export const validateObjetivosData = (data) => {
    let errors = {};

    // 📝 Validar y sanitizar los textos
    const safeTitulo = DOMPurify.sanitize(data.nombre);
    if (safeTitulo !== data.nombre) {
        errors.nombre = "El nombre contiene código no permitido.";
    }
    if (validator.isEmpty(data.nombre.trim())) {
        errors.nombre = "El nombre no puede estar vacío.";
    }

    const safeDescripcion = DOMPurify.sanitize(data.descripcion);
    if (safeDescripcion !== data.descripcion) {
        errors.descripcion = "La descripción contiene código no permitido.";
    }
    if (validator.isEmpty(data.descripcion.trim())) {
        errors.descripcion = "La descripción no puede estar vacía.";
    }

    // 🔢 Validar números de 0 a 200
    const numericFields = [
        "proteinas",
        "carbohidratos",
        "grasas_saturadas",
        "grasas_insaturadas",
        "grasas_trans",
        "sodio",
    ];

    numericFields.forEach((field) => {
        const value = data[field];

        if (!validator.isNumeric(String(value))) {
            errors[field] = `El campo ${field} debe ser un número.`;
        } else if (value < 0 || value > 200) {
            errors[field] = `El campo ${field} debe estar entre 0 y 200.`;
        }
    });

    return errors;
};

export const validateHealthData = (healthData) => {
    let errors = {};

    // Validar puntuacion
    if (
        isNaN(healthData.puntuacion) ||                      // Check if it's a number
        healthData.puntuacion < 0 ||                         // Check min
        healthData.puntuacion > 500 ||                       // Check max
        healthData.puntuacion % 10 !== 0                     // Check multiple of 10
    ) {
        errors.puntuacion = "La puntuación debe ser un número múltiplo de 10 entre 0 y 500.";
    }

    // Validar verificado
    const verificadoOptions = ["Utilizar", "No Utilizar"];
    if (!verificadoOptions.includes(healthData.verificado)) {
        errors.verificado = "La opción seleccionada no es válida.";
    }

    return errors;
};