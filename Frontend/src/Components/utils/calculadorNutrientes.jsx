

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
        let conversion = (ingredient.cantidad/porcionInicial) * (porcionFinal);
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
    console.log(porcentajesNutrimentales)
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