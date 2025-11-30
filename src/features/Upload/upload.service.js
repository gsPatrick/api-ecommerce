const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { File } = require('../../models');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

class UploadService {
    async saveFileRecord(fileData, userId) {
        return await File.create({
            filename: fileData.filename,
            original_name: fileData.originalname,
            mime_type: fileData.mimetype,
            size: fileData.size,
            path: fileData.path,
            url: `/uploads/${fileData.filename}`, // Assuming static serve
            userId
        });
    }
}

module.exports = { upload, uploadService: new UploadService() };
