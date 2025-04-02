import RecipeInstructions from './RecipeInstructions';
import styles from './RecipePreparation.module.css';
import imgTest from '../assets/smile.png';

export default function RecipePreparation(){
    let recetaExample = {
        "text": [
            {
                "type": "heading-one",
                "children": [
                  {
                    "text": "This is heading one"
                  }
                ]
              },
          {
            "type": "bulleted-list",
            "children": [
              {
                "children": [
                  {
                    "text": "Preheat the oven to 180°C",
                    "bold": true
                  }
                ]
              },
              {
                "children": [
                  {
                    "text": "Mix all ingredients in a bowl"
                  }
                ]
              }
            ]
          },
          {
            "type": "numbered-list",
            "children": [
              {
                "children": [
                  {
                    "text": "Step 1: Chop the vegetables",
                    "italic": true
                  }
                ]
              },
              {
                "children": [
                  {
                    "text": "Step 2: Cook over medium heat",
                    "underline": true
                  }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "children": [
              {
                "text": "La pavlova clásica es uno de esos pasteles que dejan al personal con la boca abierta. Un nido de merengue cubierto de nata montada y fresas… ¿cómo se os queda el cuerpo? Es llamativa y bonita a rabiar. Además, como ya domináis el tema de los merengues gracias a nuestros doctos consejos (ejem) podéis atacar sin miedo esta receta de pavlova. Que sí, ya veréis. Se dice que la pavlova se creó en honor de la bailarina rusa Anna Pavlova, durante una de sus giras por Australia y Nueva Zelanda en los años 20 del pasado siglo; parece que ambos países se pelean por ser los padres del invento. Y a nosotros… ¿qué más nos da? Lo que nos importa es que es una estupenda combinación de sabores y texturas. Para no desmerecer de su origen he seguido la receta que el australiano de nacimiento Dan Lepard, famoso panadero y repostero, da en su excelente libro Short&Sweet. El único misterio que tiene la pavlova es el merengue, que es un merengue francés con algo de almidón de maíz. El merengue debe quedar crujiente por fuera, pero suave por el centro, con una consistencia similar a la de las nubes de chuchería. El merengue se puede preparar con cierta antelación, pero hay que añadirle la nata montada y la fruta fresca en el último momento ya que podrían humedecerlo y fastidiar la consistencia., visit ",
                "bold": true
              },
              {
                "text": "this website",
                "link": true,
                "url": "https://example.com",
                "underline": true
              }
            ]
          },
          {
            "type": "heading-two",
            "children": [
              {
                "text": "This is heading two"
              }
            ]
          },
        ]
      }
    return(
        <div className={styles.recipePreparationContainer}>
            <h4 className={styles.recipeContentsText}>Procedimiento:</h4>
            <div className={styles.recipeContentsUsefulData}>
                <RecipeInstructions recipeProcess={recetaExample}/>
            </div>
        </div>
    )
}