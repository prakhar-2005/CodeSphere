const fs = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');

const dirInputs = path.join(__dirname, '../temp/inputs');

const ensureDirExists = async () => {
    try {
        await fs.mkdir(dirInputs, { recursive: true }); 
    } catch (err) {
        console.error("Failed to create input directory:", err);
    }
};

const generateInputFile = async (input) => {
    await ensureDirExists();
    const filename = `${uuid()}.txt`;
    const filePath = path.join(dirInputs, filename);
    await fs.writeFile(filePath, input);
    return filePath;
};

module.exports = { generateInputFile };