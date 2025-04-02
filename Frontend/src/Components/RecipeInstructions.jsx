import styles from './RecipeInstructions.module.css';

export default function RecipeInstructions({recipeProcess}){
    return(
        <div className={styles.RecipeInstructionsContainer}>
            { 
                recipeProcess.text.map(content => (content.type === "bulleted-list" || content.type === "numbered-list") 
                ? <ul className={styles[content.type]}>{content.children.map(content2 => content2.children.map(content3 => <li key={content3.text} className={`${content3.code ? styles.code : ""} ${content3.italic ? styles.italic : ""} ${content3.underline ? styles.underline : ""} ${content3.bold ? styles.bold : ""}`}>{content3.text}</li>) )}</ul>
                : (content.type === "image") 
                ? <img key={content.url} className={styles.recipe_description_img} src={content.url} />
                : <p className={styles[content.type]}>{content.children.map(el => el.link ? <a target={"_blank"} rel={"noreferrer"} href={el.url} className={`${el.code ? styles.code : ""} ${el.italic ? styles.italic : ""} ${el.underline ? styles.underline : ""} ${el.bold ? styles.bold : ""} link_url`}>{el.text}</a> : <span className={`${el.code ? styles.code : ""} ${el.italic ? styles.italic : ""} ${el.underline ? styles.underline : ""} ${el.bold ? styles.bold : ""}`}>{el.text}</span>)}</p>) 
            }
        </div>
    )
}