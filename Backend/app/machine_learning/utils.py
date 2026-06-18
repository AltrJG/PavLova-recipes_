from decimal import Decimal, ROUND_HALF_UP, getcontext
from app.models import RecetaIngrediente

getcontext().prec = 6

def redondear(valor):
    return Decimal(valor).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def calcular_nutrientes(receta, porcion_final=1):
    info = {
        'calorias': Decimal(0),
        'proteina': Decimal(0),
        'carbohidratos': Decimal(0),
        'grasas_saturadas': Decimal(0),
        'grasas_insaturadas': Decimal(0),
        'grasas_trans': Decimal(0),
        'sodio': Decimal(0)
    }

    porcion_inicial = receta.porciones
    receta_ingredientes = RecetaIngrediente.objects.filter(receta=receta).select_related('ingrediente')

    for ri in receta_ingredientes:
        ingrediente = ri.ingrediente
        unidad = ri.unidad.lower()
        escala_agua = Decimal(ingrediente.escala_agua or 1)

        if unidad == 'cucharadita':
            metrica = Decimal(5) * escala_agua
        elif unidad == 'cucharada':
            metrica = Decimal(15) * escala_agua
        elif unidad == 'taza':
            metrica = Decimal(250) * escala_agua
        elif unidad == 'numerica':
            metrica = Decimal(1)
        else:
            metrica = Decimal(unidad.split(' ')[0])

        conversion = (Decimal(ri.cantidad) * metrica / porcion_inicial) * porcion_final

        info['calorias'] += Decimal(ingrediente.calorias) * conversion
        info['proteina'] += Decimal(ingrediente.proteinas) * conversion
        info['carbohidratos'] += Decimal(ingrediente.carbohidratos) * conversion
        info['grasas_saturadas'] += Decimal(ingrediente.grasas_saturadas) * conversion
        info['grasas_insaturadas'] += Decimal(ingrediente.grasas_insaturadas) * conversion
        info['grasas_trans'] += Decimal(ingrediente.grasas_trans) * conversion
        info['sodio'] += Decimal(ingrediente.sodio) * conversion

    info = {k: redondear(v) for k, v in info.items()}

    #print(f'Nutrientes calculados para receta "{receta.nombre}": {info}')
    return info