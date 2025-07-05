import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import templatePdf from '../../assets/recetas_plantilla.pdf';
import nutritionalPdf from '../../assets/planAlimenticio_plantilla.pdf';
import { saveAs } from 'file-saver';
import { calcularNutrientes, calcularNutrienteAporteCalorias, calcularPorcentajesVDR } from './calculadorNutrientes';

export async function generarRecetaPDF(recetaData, porciones, insertarPlan = false) {
  const existingPdfBytes = await fetch(templatePdf).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  let page = pdfDoc.getPages()[0];
  let firstPage = page;
  let paginasGeneradas = [1];
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  async function convertWebPToPngBytes(webpUrl) {
    const res = await fetch(webpUrl);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    const pngBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return pngBytes;
  }

  const pngBytes = await convertWebPToPngBytes(recetaData.foto_receta);
  const embeddedImage = await pdfDoc.embedPng(pngBytes);

  page.drawImage(embeddedImage, {
    x: 32,
    y: height - 285,
    width: 250,
    height: 160,
  });

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
  page.drawText(`Porciones: ${porciones}`, { x: 65, y: height - 355, size: 10, font });

  let yFrase = height - 170;
  ({ page, y: yFrase } = await drawWrappedText({ page, text: `"${recetaData.frase}"`, x: 300, y: yFrase, size: 14, maxWidth: 280 }));

  let yIngredientes = height - 375;
  for (let ing of recetaData.ingredientes) {
    const text = `• ${((ing.cantidad/recetaData.porciones)*porciones).toFixed(1)} ${ing.unidad == 'numerica' ? (ing.ingrediente.consistencia == 'solido' ? "g" : "ml") : ing.unidad == 'cucharadita' ? "cdta." : (ing.unidad == "cucharada" ? "cda." : (ing.unidad == "taza" ? "taza" : ""))} de ${ing.ingrediente.nombre}`;
    ({ page, y: yIngredientes } = await drawWrappedText({ page, text, x: margin, y: yIngredientes, size: 12, maxWidth: 190 }));
  }

  // 📋 Procedimiento
  page = firstPage;
  let yProceso = height - 365;
  try {
    const pasos = JSON.parse(recetaData.procedimiento);
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
  let nutrientes = calcularNutrientes(recetaData.ingredientes, recetaData.porciones, porciones);
  let porcionIndividual = calcularNutrientes(recetaData.ingredientes, recetaData.porciones, 1);
  let porcentajePorCalorias = calcularNutrienteAporteCalorias(porcionIndividual);
  let porcentajeNutricionalDiario = calcularPorcentajesVDR(porcionIndividual);

  page.drawText((`${porciones}`), { x: 383, y: height - 60, size: 20, font, maxWidth: 60 });

  // Llenar los campos con la informacion nutricional
  page.drawText((`${nutrientes.calorias.toFixed(2)} g`), { x: 355, y: height - 120, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.carbohidratos.toFixed(2)} g`), { x: 355, y: height - 160, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.proteina.toFixed(2)} g`), { x: 355, y: height - 200, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.grasas_saturadas.toFixed(2)} g`), { x: 355, y: height - 240, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.grasas_insaturadas.toFixed(2)} g`), { x: 355, y: height - 280, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.grasas_trans.toFixed(2)} g`), { x: 355, y: height - 320, size: 20, font, maxWidth: 300 });
  page.drawText((`${nutrientes.sodio.toFixed(2)} mg`), { x: 355, y: height - 360, size: 20, font, maxWidth: 300 });

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
  page.drawText((`${porcentajeNutricionalDiario.sodio}%`), { x: 320, y: height - 765, size: 16, font, maxWidth: 300 });

  pdfDoc.removePage(1);
  pdfDoc.removePage(1);

  if(insertarPlan){
    return pdfDoc;
  } else{
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, `${recetaData.nombre.replace(/ /g, "_")}.pdf`);
  }
}

export async function generarPlanDiaPDF(recetas, porciones, objetivos, nutrientesCalorias, infoNutricional, diaRef, ingredientes, cantidadPersonas, nutritionalAlerts){
  const existingPdfBytes = await fetch(nutritionalPdf).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  let page = pdfDoc.getPages()[0];
  let firstPage = page;
  let paginasGeneradas = [1];
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const lineHeight = 16;
  const margin = 22;

  const addTemplatePage2 = async () => {
    let currentIndex = pdfDoc.getPages().indexOf(page);
    currentIndex == 0 && currentIndex++;
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
  page.drawText(`(${diaRef.dia})`, { x: 230, y: height - 90, size: 25, font, maxWidth: 500, color: rgb(.9607, .368, 0) });
  page.drawText(`${infoNutricional.tiempo_preparacion} Minutos`, { x: 280, y: height - 135, size: 14, font });
  page.drawText(`${infoNutricional.tiempo_coccion} Minutos`, { x: 460, y: height - 135, size: 14, font });

  let yRecetas = height - 125;
  for (let receta of recetas) {
    const text = `• ${receta.nombre} (${porciones[receta.id]} Porciones)`;
    ({ page, y: yRecetas } = await drawWrappedText({ page, text, x: margin, y: yRecetas, size: 12, maxWidth: 190 }));
  }

  let yIngredientes = height - 415;
  for (let ing of ingredientes) {
    const text = `• ${ing.text}`;
    ({ page, y: yIngredientes } = await drawWrappedText({ page, text, x: margin, y: yIngredientes, size: 12, maxWidth: 190 }));
  }

  page = firstPage;

  let yAlertas = height - 620;
  for (let key of Object.keys(nutritionalAlerts)) {
    const text = `${nutritionalAlerts[key].estado}: ${nutritionalAlerts[key].mensaje}`;
    ({ page, y: yAlertas } = await drawWrappedText({ page, text, x: 230, y: yAlertas, size: 12, maxWidth: 360 }));
  }

  page = firstPage;

  // Llenar los campos con la informacion nutricional
  page.drawText((`${(objetivos.calorias*cantidadPersonas).toFixed(2)} kcal`), { x: 353, y: height - 225, size: 12, font, maxWidth: 300 });
  page.drawText((`${(objetivos.carbohidratos*cantidadPersonas).toFixed(2)} g`), { x: 353, y: height - 250, size: 12, font, maxWidth: 300 });
  page.drawText((`${(objetivos.proteina*cantidadPersonas).toFixed(2)} g`), { x: 353, y: height - 278, size: 12, font, maxWidth: 300 });
  page.drawText((`${(objetivos.grasas_saturadas*cantidadPersonas).toFixed(2)} g`), { x: 353, y: height - 308, size: 12, font, maxWidth: 300 });
  page.drawText((`${(objetivos.grasas_insaturadas*cantidadPersonas).toFixed(2)} g`), { x: 353, y: height - 333, size: 12, font, maxWidth: 300 });
  page.drawText((`${(objetivos.grasas_trans*cantidadPersonas).toFixed(2)} g`), { x: 353, y: height - 363, size: 12, font, maxWidth: 300 });
  page.drawText((`${(objetivos.sodio*cantidadPersonas).toFixed(2)} mg`), { x: 353, y: height - 390, size: 12, font, maxWidth: 300 });

  // Llenar los campos con la informacion nutricional
  page.drawText((`${infoNutricional.calorias.toFixed(2)} kcal (${((infoNutricional.calorias/(objetivos.calorias*cantidadPersonas))*100).toFixed(1)}%)`), { x: 438, y: height - 225, size: 12, font, maxWidth: 300 });
  page.drawText((`${infoNutricional.carbohidratos.toFixed(2)} g (${((infoNutricional.carbohidratos/(objetivos.carbohidratos*cantidadPersonas))*100).toFixed(1)}%)`), { x: 438, y: height - 250, size: 12, font, maxWidth: 300 });
  page.drawText((`${infoNutricional.proteina.toFixed(2)} g (${((infoNutricional.proteina/(objetivos.proteina*cantidadPersonas))*100).toFixed(1)}%)`), { x: 438, y: height - 278, size: 12, font, maxWidth: 300 });
  page.drawText((`${infoNutricional.grasas_saturadas.toFixed(2)} g (${((infoNutricional.grasas_saturadas/(objetivos.grasas_saturadas*cantidadPersonas))*100).toFixed(1)}%)`), { x: 438, y: height - 308, size: 12, font, maxWidth: 300 });
  page.drawText((`${infoNutricional.grasas_insaturadas.toFixed(2)} g (${((infoNutricional.grasas_insaturadas/(objetivos.grasas_insaturadas*cantidadPersonas))*100).toFixed(1)}%)`), { x: 438, y: height - 333, size: 12, font, maxWidth: 300 });
  page.drawText((`${infoNutricional.grasas_trans.toFixed(2)} g (${((infoNutricional.grasas_trans/(objetivos.grasas_trans*cantidadPersonas))*100).toFixed(1)}%)`), { x: 438, y: height - 363, size: 12, font, maxWidth: 300 });
  page.drawText((`${infoNutricional.sodio.toFixed(2)} mg (${((infoNutricional.sodio/(objetivos.sodio*cantidadPersonas))*100).toFixed(1)}%)`), { x: 438, y: height - 390, size: 12, font, maxWidth: 300 });

  page.drawText((`${nutrientesCalorias[0].value}%`), { x: 435, y: height - 580, size: 16, font, maxWidth: 300 });
  page.drawText((`${nutrientesCalorias[1].value}%`), { x: 320, y: height - 580, size: 16, font, maxWidth: 300 });
  page.drawText((`${nutrientesCalorias[2].value}%`), { x: 263, y: height - 512, size: 16, font, maxWidth: 300 });
  page.drawText((`${nutrientesCalorias[3].value}%`), { x: 385, y: height - 515, size: 16, font, maxWidth: 300 });
  page.drawText((`${nutrientesCalorias[4].value}%`), { x: 495, y: height - 515, size: 16, font, maxWidth: 300 });

  pdfDoc.removePage(1);
  
  // Al final de la función, antes de guardar el PDF:
  for (let receta of recetas) {
    const recetaDoc = await generarRecetaPDF(receta, porciones[receta.id], true); // Asegúrate que porciones[receta.id] exista

    const recetaPages = await pdfDoc.copyPages(recetaDoc, recetaDoc.getPageIndices());

    for (const page of recetaPages) {
      pdfDoc.addPage(page); // Inserta cada página del PDF de receta al final del plan del día
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `${diaRef.dia}_planAlimenticio.pdf`);
}