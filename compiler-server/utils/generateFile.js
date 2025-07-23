const fs = require('fs').promises; // promise-based fs
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, '../temp/code');

const ensureDirExists = async () => {
    try {
        await fs.mkdir(dirCodes, { recursive: true });
    } catch (err) {
        console.error("Directory creation error:", err);
    }
}

const generateFile = async (extension, content, className = null) => {
    await ensureDirExists();
    const filename = className ? `${className}.${extension}` : `${uuid()}.${extension}`;
    const filePath = path.join(dirCodes, filename);
    await fs.writeFile(filePath, content);
    return filePath;
};

module.exports = { generateFile };