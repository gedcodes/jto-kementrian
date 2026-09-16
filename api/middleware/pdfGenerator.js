const fs = require('fs');
const pdf = require('html-pdf-node');

/**
 * Mengganti fungsi pdf.create(html, options).toFile(output, cb)
 * menjadi fungsi async generatePdfFile(html, options, output)
 */
async function generatePdfFile(html, options, outputPath) {
  const file = { content: html };

  // Default options agar seragam
  const defaultOptions = {
    format: 'A4',
    printBackground: true,
    landscape: false,
    margin: { top: '10mm', bottom: '10mm' },
  };

  const pdfBuffer = await pdf.generatePdf(file, { ...defaultOptions, ...options });
  fs.writeFileSync(outputPath, pdfBuffer);

  return outputPath;
}

module.exports = { generatePdfFile };
