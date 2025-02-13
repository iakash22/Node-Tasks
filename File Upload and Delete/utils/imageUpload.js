const multer = require('multer');
const path = require('path');

const dist = path.resolve('./tmp/uploads');
// console.log(dist);
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dist);
    },
    filename: (req, file, cb) => {
        const uniqeSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqeSuffix);
    }
});

const checkFiletype = (file) => {
    const fileStats = file.split('.');
    const type = fileStats[fileStats.length - 1];
    if (type === "webp" || type === "png" || type === "jpeg" || type === "jpg" || type === "gif" || type === "svg") {
        return "image";
    }
    if (type === "mp4" || type === "mov" || type === "webm" || type === "mpeg") {
        return "video";
    }
    return "file";
}

module.exports = { storage, checkFiletype }; 