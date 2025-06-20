

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
    console.log(ingredientes);
    ingredientes.map(ingredient => {
        let metrica = ingredient.unidad == 'cucharadita' ? 5 : (ingredient.unidad == 'cucharada' ? 15 : (ingredient.unidad == 'taza' ? 250 : 1));
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
      grasas_trans: 2              // g (máximo tolerado)
    };
  
    const calcularPorcentaje = (valor, referencia) =>
      ((valor / referencia) * 100).toFixed(2);
  
    const porcentajesVDR = {
      proteina: calcularPorcentaje(informacionNutrimental.proteina, VDR.proteina),
      carbohidratos: calcularPorcentaje(informacionNutrimental.carbohidratos, VDR.carbohidratos),
      grasas_saturadas: calcularPorcentaje(informacionNutrimental.grasas_saturadas, VDR.grasas_saturadas),
      grasas_insaturadas: calcularPorcentaje(informacionNutrimental.grasas_insaturadas, VDR.grasas_insaturadas),
      grasas_trans: calcularPorcentaje(informacionNutrimental.grasas_trans, VDR.grasas_trans),
      calorias: calcularPorcentaje(informacionNutrimental.calorias, VDR.calorias)
    };
  
    console.log(porcentajesVDR);
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
    porcionUtilizar = porciones[receta['id']];
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
        text: `${(ingredient.cantidad.toFixed(2))} ${ingredient.unidad == 'numerica' ? (ingredient.ingrediente.consistencia == 'solido' ? "g" : "ml") : ingredient.unidad == 'cucharadita' ? "cdta." : (ingredient.unidad == "cucharada" ? "cda." : (ingredient.unidad == "taza" ? "taza" : ""))} de ${ingredient.ingrediente.nombre}`,
        image: ingredient.ingrediente.foto_ingrediente.includes('ingrediente_placeholder') ? null : ingredient.ingrediente.foto_ingrediente
      };
      conversionResultado.push(objetoConvertido);
    });
  })
  return conversionResultado;
}