

export const calcularNutrientes = (ingredientes, porcionInicial, porcionFinal) => {
    let informacionNutrimental = {
        calorias: 0,
        proteina: 0,
        carbohidratos: 0,
        grasas_saturadas: 0,
        grasas_insaturadas: 0,
        grasas_trans: 0,
        sodio: 0
    }
    ingredientes.map(ingredient => {
        let metrica = ingredient.unidad == 'cucharadita' 
        ? (5*ingredient.ingrediente.escala_agua) 
        : (ingredient.unidad == 'cucharada' 
          ? (15*ingredient.ingrediente.escala_agua) 
          : (ingredient.unidad == 'taza' 
            ? (250*ingredient.ingrediente.escala_agua) 
            : (ingredient.unidad == 'numerica' 
              ? 1
              : Number(ingredient.unidad.split(' ')[0]))));
        let conversion = ((ingredient.cantidad*metrica)/porcionInicial) * (porcionFinal);
        informacionNutrimental.calorias += (ingredient.ingrediente.calorias * (conversion));
        informacionNutrimental.proteina += (ingredient.ingrediente.proteinas * (conversion));
        informacionNutrimental.carbohidratos += (ingredient.ingrediente.carbohidratos * (conversion));
        informacionNutrimental.grasas_saturadas += (ingredient.ingrediente.grasas_saturadas * (conversion));
        informacionNutrimental.grasas_insaturadas += (ingredient.ingrediente.grasas_insaturadas * (conversion));
        informacionNutrimental.grasas_trans += (ingredient.ingrediente.grasas_trans * (conversion));
        informacionNutrimental.sodio += (ingredient.ingrediente.sodio * (conversion));
    });
    return informacionNutrimental;
}

export const calcularNutrienteAporteCalorias = (informacionNutrimental) =>{
    const caloriasTotales = informacionNutrimental.calorias;

    const kcalProteina = informacionNutrimental.proteina * 4;
    const kcalCarbohidratos = informacionNutrimental.carbohidratos * 4;
    const kcalGrasasSaturadas = informacionNutrimental.grasas_saturadas * 9;
    const kcalGrasasInsaturadas = informacionNutrimental.grasas_insaturadas * 9;
    const kcalGrasasTrans = informacionNutrimental.grasas_trans * 9;

    let porcentajesNutrimentales = {
        proteina: ((kcalProteina / caloriasTotales) * 100).toFixed(2),
        carbohidratos: ((kcalCarbohidratos / caloriasTotales) * 100).toFixed(2),
        grasas_saturadas: ((kcalGrasasSaturadas / caloriasTotales) * 100).toFixed(2),
        grasas_insaturadas: ((kcalGrasasInsaturadas / caloriasTotales) * 100).toFixed(2),
        grasas_trans: ((kcalGrasasTrans / caloriasTotales) * 100).toFixed(2)
    };
    return porcentajesNutrimentales;
}

export const calcularPorcentajesVDR = (informacionNutrimental) => {
    // Valores diarios recomendados aproximados (pueden ajustarse según la fuente oficial)
    const VDR = {
      calorias: 2000,               // kcal
      proteina: 50,                 // g
      carbohidratos: 275,          // g
      grasas_saturadas: 20,        // g
      grasas_insaturadas: 44,      // g (ejemplo para grasas saludables)
      grasas_trans: 2,              // g (máximo tolerado)
      sodio: 2300                  // mg
    };
  
    const calcularPorcentaje = (valor, referencia) =>
      ((valor / referencia) * 100).toFixed(2);
  
    const porcentajesVDR = {
      proteina: calcularPorcentaje(informacionNutrimental.proteina, VDR.proteina),
      carbohidratos: calcularPorcentaje(informacionNutrimental.carbohidratos, VDR.carbohidratos),
      grasas_saturadas: calcularPorcentaje(informacionNutrimental.grasas_saturadas, VDR.grasas_saturadas),
      grasas_insaturadas: calcularPorcentaje(informacionNutrimental.grasas_insaturadas, VDR.grasas_insaturadas),
      grasas_trans: calcularPorcentaje(informacionNutrimental.grasas_trans, VDR.grasas_trans),
      calorias: calcularPorcentaje(informacionNutrimental.calorias, VDR.calorias),
      sodio: calcularPorcentaje(informacionNutrimental.sodio, VDR.sodio)
    };
  
    return porcentajesVDR;
  };

export const combineIngredients = (recetas, porciones) => {
  let resultado = {};
  let conversionResultado = [];
  let objetoConvertido;
  let ingredienteExiste;
  let porcionUtilizar;
  recetas.forEach(receta => {
    // Retorna la porcion a utilizar
    porcionUtilizar = porciones[String(receta['id'])]?.value;
    receta.ingredientes.forEach(ingrediente => {
      if(!resultado[ingrediente['unidad']]){
        // Crear la separacion de la unidad como arreglo vacio y que este el ingrediente forme parte de el
        resultado[ingrediente['unidad']] = [];
        resultado[ingrediente['unidad']].push({...ingrediente, cantidad: ((ingrediente.cantidad/receta.porciones)*porcionUtilizar)});
      } else{
        // En caso de que exista la metrica, verificar si comparte su id con un ingrediente ya presente
        ingredienteExiste = resultado[ingrediente['unidad']].findIndex(resultadoIngrediente => resultadoIngrediente.ingrediente.id == ingrediente.ingrediente.id);
        if(ingredienteExiste != -1){
          // Sumar las proporciones
          resultado[ingrediente['unidad']][ingredienteExiste].cantidad += ((ingrediente.cantidad/receta.porciones)*porcionUtilizar);
        } else{
          // En caso contrario, agregarlo en el array
          resultado[ingrediente['unidad']].push({...ingrediente, cantidad: ((ingrediente.cantidad/receta.porciones)*porcionUtilizar)});
        }
      }
    });
  });
  //Convertir el resultado en un formato para el frontend
  Object.keys(resultado).forEach(key => {
    //Acceder a los ingredientes de cada metrica
    resultado[key].forEach(ingredient => {
      objetoConvertido = {
        text: `${(ingredient.cantidad.toFixed(2))} ${ingredient.unidad == 'numerica' ? (ingredient.ingrediente.consistencia == 'solido' ? "g" : "ml") : ingredient.unidad == 'cucharadita' ? "cdta." : (ingredient.unidad == "cucharada" ? "cda." : (ingredient.unidad == "taza" ? "taza" : ""))} ${['taza', 'cucharadita', 'cucharada', 'numerica'].includes(ingredient.unidad) ? 'de' : ''} ${!['taza', 'cucharadita', 'cucharada', 'numerica'].includes(ingredient.unidad) ? ingredient.unidad.trim().split(' ').slice(1).join(' ') : ingredient.ingrediente.nombre}`,
        image: ingredient.ingrediente.foto_ingrediente.includes('ingrediente_placeholder') ? null : ingredient.ingrediente.foto_ingrediente
      };
      conversionResultado.push(objetoConvertido);
    });
  })
  return conversionResultado;
}

export const calculateNutritionalValuesObjectives = (resultado, objetivos, personas) => {
  let alertas = {};
  let division;
  Object.keys(objetivos).forEach(objetivo => {
    division = (resultado[objetivo]/(objetivos[objetivo]*personas))*100;
    if(objetivo == "calorias"){
      if(division >= 90 && division <= 110){
        alertas[objetivo] = {estado: "Aceptable", mensaje: "Las calorias se ajustan aproximadamente a tu objetivo, bien hecho!"};
      } else if(division < 90){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "Una ingesta calórica baja puede causar fatiga, pérdida muscular y déficit de nutrientes esenciales."}
      } else if(division > 110){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "Consumir más calorías de las que tu cuerpo necesita puede favorecer el aumento de peso y el riesgo de enfermedades metabólicas."}
      }
    }
    if(objetivo == "proteina"){
      if(division >= 90 && division <= 110){
        alertas[objetivo] = {estado: "Aceptable", mensaje: "Las proteinas se ajustan aproximadamente a tu objetivo, bien hecho!"};
      } else if(division < 90){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "Una ingesta insuficiente de proteínas puede provocar pérdida de masa muscular, debilidad y un sistema inmune debilitado."}
      } else if(division > 110){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "Un exceso de proteínas puede sobrecargar los riñones y aumentar la deshidratación."}
      }
    }
    if(objetivo == 'carbohidratos'){
      if(division >= 80 && division <= 110){
        alertas[objetivo] = {estado: "Aceptable", mensaje: "Los carbohidratos se ajustan aproximadamente a tu objetivo, bien hecho!"};
      } else if(division < 80){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "Muy pocos carbohidratos pueden producir fatiga, dificultad para concentrarse y mal funcionamiento del sistema nervioso."}
      } else if(division > 110){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "El consumo elevado de carbohidratos, especialmente azúcares simples, puede causar picos de glucosa y contribuir al sobrepeso."}
      }
    }
    if(objetivo == 'grasas_saturadas'){
      if(division >= 90 && division <= 105){
        alertas[objetivo] = {estado: "Aceptable", mensaje: "Las grasas saturadas se ajustan aproximadamente a tu objetivo, considera mantener este valor lo mas bajo posible"};
      } else if(division < 90){
        alertas[objetivo] = {estado: 'Aceptable', mensaje: "Reducir las grasas saturadas suele ser positivo para la salud cardiovascular."}
      } else if(division > 105){
        alertas[objetivo] = {estado: 'Peligro', mensaje: "El exceso de grasas saturadas puede aumentar el colesterol LDL (‘malo’) y el riesgo de enfermedades cardiovasculares."}
      }
    }
    if(objetivo == 'grasas_insaturadas'){
      if(division >= 90 && division <= 110){
        alertas[objetivo] = {estado: "Aceptable", mensaje: "Las grasas insaturadas se ajustan aproximadamente a tu objetivo, bien hecho!"};
      } else if(division < 90){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "La falta de grasas insaturadas puede comprometer la salud del corazón y reducir la absorción de vitaminas liposolubles (A, D, E, K)."}
      } else if(division > 110){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "Aunque son saludables, un exceso de grasas insaturadas eleva las calorías totales y puede afectar el peso corporal."}
      }
    }
    if(objetivo == 'grasas_trans'){
      if(division >= 90 && division <= 100){
        alertas[objetivo] = {estado: "Atencion", mensaje: "Las grasas trans no deben de exceder tu objetivo para una mejor salud"};
      } else if(division < 90){
        alertas[objetivo] = {estado: 'Aceptable', mensaje: "No hay problema, las grasas trans deben evitarse completamente."}
      } else if(division > 100){
        alertas[objetivo] = {estado: 'Peligro', mensaje: "Las grasas trans son dañinas incluso en pequeñas cantidades. Aumentan el colesterol LDL y reducen el HDL (‘bueno’), elevando el riesgo cardiovascular."}
      }
    }
    if(objetivo == 'sodio'){
      if(division >= 80 && division <= 110){
        alertas[objetivo] = {estado: "Aceptable", mensaje: "El sodio está dentro del rango recomendado para una buena salud cardiovascular."};
      } else if(division < 80){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "Muy poco sodio puede provocar calambres, mareos y deshidratación. (El minimo recomendado son 500mg)"}
      } else if(division > 110){
        alertas[objetivo] = {estado: 'Alerta', mensaje: "El exceso de sodio puede elevar la presión arterial y aumentar el riesgo de enfermedades cardíacas y renales."}
      }
    }
  });
  return alertas;
}