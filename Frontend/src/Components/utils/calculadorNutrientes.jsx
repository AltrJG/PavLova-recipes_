

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