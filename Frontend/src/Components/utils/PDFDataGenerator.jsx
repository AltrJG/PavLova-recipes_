import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import templatePdf from '../../assets/recetas_plantilla.pdf';
import { saveAs } from 'file-saver';
import { calcularNutrientes, calcularNutrienteAporteCalorias, calcularPorcentajesVDR } from './calculadorNutrientes';

export async function generarRecetaPDF(recetaData) {
  const existingPdfBytes = await fetch(templatePdf).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  let page = pdfDoc.getPages()[0];
  let firstPage = page;
  let paginasGeneradas = [1];
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const lineHeight = 16;
  const margin = 25;

  const addTemplatePage2 = async () => {
    let currentIndex = pdfDoc.getPages().indexOf(page);
    currentIndex == 0 && currentIndex++;
    currentIndex == 1 && currentIndex++;
    if(currentIndex >= paginasGeneradas[paginasGeneradas.length -1]){
        const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [1]);
        let newPage = pdfDoc.addPage(copiedPage);
        paginasGeneradas.push(pdfDoc.getPages().indexOf(newPage));
        return copiedPage;
    } else {
        return pdfDoc.getPages()[currentIndex+1];
    }
  };

  const wrapText = (text, maxWidth, font, fontSize) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawWrappedText = async ({ page, text, x, y, size = 12, maxWidth = 260 }) => {
    if (text == "") {
        y -= lineHeight;
        if (y < 40) {
          page = await addTemplatePage2();
          y = height - 40;
        }
    
        return { page, y };
      }
    const lines = wrapText(text, maxWidth, font, size);
    for (let line of lines) {
      // Si no hay suficiente espacio, agregamos nueva página y reseteamos `y`
      if (y - lineHeight < 40) {
        page = await addTemplatePage2();
        y = height - 40;
      }
  
      page.drawText(line, { x, y, size, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
  
    return { page, y };
  };

  // 📝 Información principal
  page.drawText(recetaData.nombre, { x: 75, y: height - 90, size: 20, font, maxWidth: 500 });
  page.drawText(`${recetaData.tiempo_preparacion} Minutos`, { x: 340, y: height - 135, size: 14, font });
  page.drawText(`${recetaData.tiempo_coccion} Minutos`, { x: 490, y: height - 135, size: 14, font });
  page.drawText(`Porciones: ${recetaData.porciones}`, { x: 65, y: height - 355, size: 10, font });

  let yFrase = height - 170;
  ({ page, y: yFrase } = await drawWrappedText({ page, text: `"${recetaData.frase}"`, x: 300, y: yFrase, size: 14, maxWidth: 280 }));

  let yIngredientes = height - 375;
  for (let ing of recetaData.ingredientes) {
    const text = `• ${ing.cantidad} ${ing.unidad == 'numerica' ? (ing.ingrediente.consistencia == 'solido' ? "g" : "ml") : ing.unidad == 'cucharadita' ? "cdta." : (ing.unidad == "cucharada" ? "cda." : (ing.unidad == "taza" ? "taza" : ""))} de ${ing.ingrediente.nombre}`;
    ({ page, y: yIngredientes } = await drawWrappedText({ page, text, x: margin, y: yIngredientes, size: 12, maxWidth: 200 }));
  }

  // 📋 Procedimiento
  page = firstPage;
  let yProceso = height - 365;
  try {
    const pasos = JSON.parse(recetaData.procedimiento);
    console.log(pasos);
    for (let paso of pasos) {
      let parrafo;
      if(paso.type == 'bulleted-list' || paso.type == 'numbered-list'){
        for (let i = 0; i < paso.children.length; i++) {
            const listItem = paso.children[i];
            const text = listItem.children.map(el => el.text).join(' ').trim();
            const prefix = paso.type === 'numbered-list' ? `${i + 1}. ` : '· '; // Add number or bullet
            parrafo = `${prefix}${text}`; // Append the formatted list item to the paragraph with a newline
            ({ page, y: yProceso } = await drawWrappedText({ page, text: `${parrafo}`, x: 230, y: yProceso, size: 10, maxWidth: 350 }));
          }      
        } else {
            parrafo = paso.children.map(el => el.text).join(' ').trim();
            ({ page, y: yProceso } = await drawWrappedText({ page, text: `${paso.type == 'bulleted-list' || paso.type == 'numbered-list' ? "·" : ""}${parrafo}`, x: 230, y: yProceso, size: 10, maxWidth: 350 }));
        }
    }
  } catch (e) {
    page.drawText("Error al leer procedimiento", { x: 230, y: yProceso, size: 10, font });
  }

  // Agregar copia de la pagina de informacion nutricional
  const [nutritionalPage] = await pdfDoc.copyPages(pdfDoc, [2]);
  pdfDoc.addPage(nutritionalPage);
  page = nutritionalPage;

  // Calcular Valores nutricionales
  let nutrientes = calcularNutrientes(recetaData.ingredientes, recetaData.porciones, 1);
  let porcentajePorCalorias = calcularNutrienteAporteCalorias(nutrientes);
  let porcentajeNutricionalDiario = calcularPorcentajesVDR(nutrientes);

  // Llenar los campos con la informacion nutricional
  page.drawText((`${nutrientes.calorias.toFixed(2)} g`), { x: 375, y: height - 120, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.carbohidratos.toFixed(2)} g`), { x: 375, y: height - 160, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.proteina.toFixed(2)} g`), { x: 375, y: height - 200, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.grasas_saturadas.toFixed(2)} g`), { x: 375, y: height - 240, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.grasas_insaturadas.toFixed(2)} g`), { x: 375, y: height - 280, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.grasas_trans.toFixed(2)} g`), { x: 375, y: height - 320, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.sodio.toFixed(2)} mg`), { x: 375, y: height - 360, size: 20, font, maxWidth: 300 });

  page.drawText((`${porcentajePorCalorias.grasas_saturadas}%`), { x: 60, y: height - 541, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajePorCalorias.grasas_insaturadas}%`), { x: 172, y: height - 541, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajePorCalorias.grasas_trans}%`), { x: 284, y: height - 541, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajePorCalorias.proteina}%`), { x: 396, y: height - 541, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajePorCalorias.carbohidratos}%`), { x: 496, y: height - 541, size: 16, font, maxWidth: 300 });

  page.drawText((`${porcentajeNutricionalDiario.grasas_saturadas}%`), { x: 50, y: height - 733, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajeNutricionalDiario.grasas_insaturadas}%`), { x: 145, y: height - 733, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajeNutricionalDiario.grasas_trans}%`), { x: 235, y: height - 733, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajeNutricionalDiario.proteina}%`), { x: 330, y: height - 733, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajeNutricionalDiario.carbohidratos}%`), { x: 415, y: height - 733, size: 16, font, maxWidth: 300 });
  page.drawText((`${porcentajeNutricionalDiario.calorias}%`), { x: 510, y: height - 733, size: 16, font, maxWidth: 300 });

  pdfDoc.removePage(1);
  pdfDoc.removePage(1);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `${recetaData.nombre.replace(/ /g, "_")}.pdf`);
}