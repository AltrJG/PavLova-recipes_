import backendAPI from "../../api/axiosConfig";
import { calcularNutrienteAporteCalorias, calcularNutrientes } from "./calculadorNutrientes";
import { formatDate } from "./helpers";

export default async function generarPlanAlimenticio(recetas, opciones, objetivos, personas, dias, planId){
    // Obtener las puntuaciones de las recetas que no hayan sido calficadas
    let recetasPuntuadas = [];
    let recetasNoPuntuadas = [];
    let objetivosPersonas = objetivos;
    for (let key in objetivosPersonas) {
        if (objetivosPersonas.hasOwnProperty(key) && typeof objetivosPersonas[key] === 'number') {
            objetivosPersonas[key] *= personas;
        }
    }

    recetas.forEach(receta => {
        if(!receta.verificado){
            recetasNoPuntuadas.push(receta);
        } else{
            recetasPuntuadas.push(receta);
        }
    });
    let recetasSinPuntuacionID = recetasNoPuntuadas.map(receta => receta.id);

    // Utilizar el modelo de machine learning para calcular las puntuaciones faltantes
    const puntuaciones = await backendAPI.post(`/prediccion/predecir-puntuacion/`, { ids: recetasSinPuntuacionID });
    let recetaID;
    let recetasCompletas = recetasNoPuntuadas.map(receta => {
        recetaID = puntuaciones.data.resultados.find(prediccion => prediccion.id == receta.id);
        receta.puntuacion = recetaID.puntuacion;
        return receta;
    });
    
    // Juntar las recetas sin puntuacion con las que tenian puntuacion
    recetasCompletas = [ ...recetasCompletas, ...recetasPuntuadas ];
    
    // Obtener los valores nutricionales de las recetas
    let valoresNutricionales;
    let recetasNutricionales = recetasCompletas.map(recetaCompleta => {
        valoresNutricionales = calcularNutrientes(recetaCompleta.ingredientes, recetaCompleta.porciones, opciones.porcionesRecetas);
        return {
            ...valoresNutricionales,
            puntuacion: recetaCompleta.puntuacion,
            id: recetaCompleta.id,
            nombre: recetaCompleta.nombre
        }
    });

    // Ajustar puntuaciones por los ajustes del usuario
    let aportePorcentajes, porcentajeFinal = 0;
    // Normalizar al 100% para todas las recetas
    recetasNutricionales.forEach(recetaNutricional => {
        porcentajeFinal = 0;
        aportePorcentajes = calcularNutrienteAporteCalorias(recetaNutricional);
        aportePorcentajes = normalizarPorcentajes(aportePorcentajes);
        aportePorcentajes.id = recetaNutricional.id;
        aportePorcentajes.nombre = recetaNutricional.nombre;
        aportePorcentajes.puntuacion = recetaNutricional.puntuacion;
        porcentajeFinal += (aportePorcentajes.proteina*(opciones.proteinas/100));
        porcentajeFinal += (aportePorcentajes.carbohidratos*(opciones.carbohidratos/100));
        porcentajeFinal += (aportePorcentajes.grasas_saturadas*(opciones.grasas_saturadas/100));
        porcentajeFinal += (aportePorcentajes.grasas_insaturadas*(opciones.grasas_insaturadas/100));
        porcentajeFinal += (aportePorcentajes.grasas_trans*(opciones.grasas_trans/100));

        // Actualizar los puntajes con los porcentajes obtenidos
        recetaNutricional.puntuacion = Math.round(recetaNutricional.puntuacion*(porcentajeFinal/100));
        // Se penaliza la receta por su contenido de sodio (depende de los ajustes)
        recetaNutricional.puntuacion = recetaNutricional.puntuacion*(1-Math.min(1, ((recetaNutricional.sodio)/objetivos.sodio)*(opciones.sodio/100)));
    });

    // Ordenar de mayor a menor las recetas por puntuacion
    recetasNutricionales.sort((itemA, itemB) => itemB.puntuacion - itemA.puntuacion);
    // Por cada dia seleccionado, generar el plan
    let date = new Date(), formattedDate, diaId, recetasSeleccionadas, recetasPenalizadas;
    let recetasAnteriores = {};
    let startDate = new Date(opciones.fechasSeleccionadas[0]+ 'T00:00:00');
    let endDate = new  Date(opciones.fechasSeleccionadas[1]+ 'T00:00:00');
    date.setDate(startDate.getDate());
    formattedDate = formatDate(date);
    let exit = 0;
    do{
        // Generar el plan de un dia
        formattedDate = formatDate(date);
        diaId = dias.find(dia => dia.dia == formattedDate);
        recetasSeleccionadas = await generateDay(recetasNutricionales, opciones, objetivosPersonas, diaId.value, planId);
        // Penalizar recetas escogidas
        recetasPenalizadas = penalizarRecetas(recetasNutricionales, recetasSeleccionadas, recetasAnteriores, opciones.modoRepeticion);
        // Reordenar recetas con nuevas puntuaciones
        recetasNutricionales = recetasPenalizadas[0];
        recetasAnteriores = recetasPenalizadas[1];
        recetasNutricionales.sort((itemA, itemB) => itemB.puntuacion - itemA.puntuacion);
        // Pasar al siguiente dia
        date.setDate(date.getDate() + 1);
        exit++;
    }while(formattedDate != formatDate(endDate) && exit < 10);
}

// Penalizar puntuacion a las recetas que ya fueron escogidas
function penalizarRecetas(recetas, recetasSeleccionadas, recetasAnteriores, modoPenalizacion){
    // Utilizar el modo de operacion seleccionado por el usuario
    let recetaIndex;
    const penalizacionPorModo = {
        Repetidas: 0.96,   // Nula penalizacion
        Flexible: 0.92,   // Penalización ligera
        Rotar: 0.86,       // Penalización moderada
        Variado: 0.8,     // Penalización alta
        Diverso: 0.5      // Modo decay
    };
    if(modoPenalizacion == "Diverso"){
        // Agregar un dia desde a las recetas que fueron penalizadas
        Object.keys(recetasAnteriores).forEach(key => {
            recetasAnteriores[key].penalty = Math.max(0, recetasAnteriores[key].penalty - .1);
            recetaIndex = recetas.findIndex(receta => receta.id == key);
            if(recetasAnteriores[key].penalty <= 0){
                // Si la receta no fue seleccionada por 5 dias, se elimina su penalty
                recetas[recetaIndex].puntuacion = recetasAnteriores[key].puntuacion;
                delete recetasAnteriores[key];
            } else{
                // Se reduce el penalty de la receta
                recetas[recetaIndex].puntuacion = recetasAnteriores[key].puntuacion-(recetasAnteriores[key].puntuacion * recetasAnteriores[key].penalty)
            }
        });
        recetasSeleccionadas.forEach(recetaSeleccionada => {
            // Por cada receta seleccionada, agregamos un penalty
            recetaIndex = recetas.findIndex(receta => receta.id == recetaSeleccionada.id);
            if(recetasAnteriores[recetaSeleccionada.id] != undefined){
                recetas[recetaIndex].puntuacion = recetasAnteriores[recetaSeleccionada.id].puntuacion*.5;
                recetasAnteriores[recetaSeleccionada.id].penalty = .5;
            } else{
                recetasAnteriores[recetaSeleccionada.id] = {
                    puntuacion: recetas[recetaIndex].puntuacion,
                    penalty: 0.5
                };
                recetas[recetaIndex].puntuacion *= .5;
            }
        });
        return [ recetas, recetasAnteriores ];
    } else{
        let penalizacion = penalizacionPorModo[modoPenalizacion];
        recetasSeleccionadas.forEach(recetaSeleccionada => {
            // Por cada receta seleccionada, agregamos un penalty
            recetaIndex = recetas.findIndex(receta => receta.id == recetaSeleccionada.id);
            recetas[recetaIndex].puntuacion *= penalizacion;
        });
        return [ recetas, recetasAnteriores ];
    }
}

// Obtener las recetas para un dia
async function generateDay(recetas, opciones, objetivos, diaId, planId){
    // Escoger las recetas para un dia
    let recetasDia = [], objetivosActuales, recetasSinEscoger = [], recetasPorcentajes = [], recetaBalanceValores, sumaObjetos, stopExecution = false;
    for(let i = 1; i <= opciones.cantRecetas; i++){
        recetasDia.push(recetas[i-1]);
        if(opciones.ajusteObjetivos == 'Si'){
            objetivosActuales = validarObjetivosActualesRecetas(recetasDia, objetivos);
            for (let key of Object.keys(objetivosActuales)) {
                if (objetivosActuales[key] >= 90 && i < opciones.cantRecetas && recetasDia.length < recetas.length) {

                    recetasSinEscoger = recetas.filter(x => !recetasDia.some(r => r.id === x.id));

                    recetasSinEscoger.forEach(recetaEscoger => {
                        recetaBalanceValores = validarObjetivosActualesRecetas([recetaEscoger], objetivos);
                        sumaObjetos = Object.keys(objetivosActuales).reduce((acc, key) => {
                            let actual = objetivosActuales[key] + recetaBalanceValores[key];
                            let diferencia = Math.abs(100 - actual);
                            return acc + diferencia;
                        }, 0);
                        recetasPorcentajes.push({ puntos: sumaObjetos, id: recetaEscoger.id });
                    });

                    recetasPorcentajes.sort((a, b) => a.puntos - b.puntos);
                    let recetaSeleccionada = recetasSinEscoger.find(r => r.id === recetasPorcentajes[0].id);
                    recetasDia.push(recetaSeleccionada);
                    stopExecution = true;
                    break;
                }
            }
            if(stopExecution) break;
        }
    }
    await backendAPI.put(`/plan_alimenticio_dia_receta/${planId}/actualizar-recetas/`, {
        dia_id: diaId,
        recetas: recetasDia.map(recetaDia => recetaDia.id)
    });
    if(opciones.porcionesRecetas != 1){
        recetasDia.forEach(async recetaDia => {
            await backendAPI.patch(`/plan_alimenticio_dia_receta/${planId}/actualizar-porcion/`, {
                dia_id: diaId,
                receta_id: recetaDia.id,
                nueva_porcion: opciones.porcionesRecetas
            });
        });
    }
    return recetasDia;
}

// Obtener los porcentajes de cada nutriente
function validarObjetivosActualesRecetas(recetas, objetivos){
    let infoNutricional = {
        calorias: 0,
        proteina: 0,
        carbohidratos: 0,
        grasas_saturadas: 0,
        grasas_insaturadas: 0,
        grasas_trans: 0,
        sodio: 0
    };
    recetas.forEach(receta => {
        infoNutricional.calorias += ((receta.calorias/(objetivos.calorias))*100);
        infoNutricional.proteina += ((receta.proteina/(objetivos.proteina))*100);
        infoNutricional.carbohidratos += ((receta.carbohidratos/(objetivos.carbohidratos))*100);
        infoNutricional.grasas_saturadas += ((receta.grasas_saturadas/(objetivos.grasas_saturadas))*100);
        infoNutricional.grasas_insaturadas += ((receta.grasas_insaturadas/(objetivos.grasas_insaturadas))*100);
        infoNutricional.grasas_trans += ((receta.grasas_trans/(objetivos.grasas_trans))*100);
        infoNutricional.sodio += ((receta.sodio/(objetivos.sodio))*100);
    });
    return infoNutricional;
}

// Normalizar los porcentajes de nutrientes para el usuario
function normalizarPorcentajes(valores) {
    // Suma total de los valores originales
    let sumaTotal = Object.values(valores).reduce((acc, val) => acc + Number(val), 0);

    // Evitar división por 0
    if (sumaTotal === 0) {
        throw new Error("La suma total es 0, no se puede normalizar.");
    }

    // Normalizar cada valor proporcionalmente
    let normalizados = {};
    Object.keys(valores).forEach(key => {
        normalizados[key] = (valores[key] / sumaTotal) * 100;
    });

    return normalizados;
}