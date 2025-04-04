const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const pdf = require('html-pdf');

const generatePrescriptionPDF = async (data, fileName) => {
    const templatePath = path.join(__dirname, '../templates/Prescription.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);
    const html = template(data);

    const dirPath = path.join(__dirname, '../public/Prescriptions');
    if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, fileName);

    return new Promise((resolve, reject) => {
        pdf.create(html, { format: 'A4' }).toFile(filePath, (err, res) => {
            if (err) return reject(err);
            resolve(res.filename); // Full path of saved file
        });
    });
};

module.exports = { generatePrescriptionPDF } ;


