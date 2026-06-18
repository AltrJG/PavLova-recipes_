import styles from './RecipeInstructions.module.css';

export default function RecipeInstructions({recipeProcess}){
    return(
        <div className={styles.RecipeInstructionsContainer}>
            { 
                recipeProcess.map((content, index) => (content.type === "bulleted-list" || content.type === "numbered-list") 
                ? <ul key={index} className={styles[content.type]}>{content.children.map((content2, index) => (
                  <li key={index}>
                      {content2.children.map((content3, index2) => (
                          <span
                              key={index2}
                              className={`
                                  ${content3.code ? styles.code : ""}
                                  ${content3.italic ? styles.italic : ""}
                                  ${content3.underline ? styles.underline : ""}
                                  ${content3.bold ? styles.bold : ""}
                              `}
                          >
                              {content3.text}
                          </span>
                      ))}
                  </li>
              ))}</ul>
                : (content.type === "image") 
                ? <img key={index} className={styles.recipe_description_img} src={content.url} />
                : <p key={index} className={styles[content.type]}>
                {content.children.length === 1 && content.children[0].text === ''
                  ? <br /> // or: '\u00A0' or '&nbsp;' for visible spacing
                  : content.children.map((el, i) =>
                      el.link
                        ? <a
                            key={i}
                            target="_blank"
                            rel="noreferrer"
                            href={el.url}
                            className={`${el.code ? styles.code : ""} ${el.italic ? styles.italic : ""} ${el.underline ? styles.underline : ""} ${el.bold ? styles.bold : ""} link_url`}>
                            {el.text || '\u00A0'}
                          </a>
                        : <span
                            key={i}
                            className={`${el.code ? styles.code : ""} ${el.italic ? styles.italic : ""} ${el.underline ? styles.underline : ""} ${el.bold ? styles.bold : ""}`}>
                            {el.text || '\u00A0'}
                          </span>
                    )
                }
              </p>) 
            }
        </div>
    )
}