const express = require('express');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const { storage, checkFiletype } = require('./utils/imageUpload');
const fs = require('fs');

const app = express();
const PORT = 3000;
const upload = multer({ storage: storage });
const dist = path.join(__dirname, '/tmp/uploads');

app.set('view engine', "ejs");
app.set('views', path.resolve('views'))
app.use('/uploads', express.static(dist));
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));
app.use(morgan("dev"));

// app.get('/', (req, res) => {
//     res.render("Home");
// });


console.log(dist);

//Upload File api
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file || null;
        // console.log(file);

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required",
            });
        }

        res.redirect('/');
    } catch (err) {
        console.log("Error Occurred while upload file", err);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err,
        });
    }
})

// Delete File api
app.post('/file/delete', (req, res) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            console.log('FileName is Required');
            return res.redirect('/');
        }

        const filePath = path.join(dist, fileName);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err.message);
                return res.redirect('/');
            }

            console.log("File deleted successfully");
            return res.redirect('/');
        });
    } catch (error) {
        console.log('Error Occurred While delete file', error);
        return res.status(501).json({
            success: false,
            message: "Server Error",
            error,
        })
    }
})

// Get All Files
app.get('/', async (req, res) => {
    try {
        fs.readdir(dist, (err, files) => {
            if (err) {
                console.log("Error Occured Fs Fetch", err);
                return res.redirect('/');
            }

            // console.log("Files : ", files);

            let filesdata = [];

            files.forEach((file) => {
                const filePath = path.join(dist, file);
                const stats = fs.statSync(filePath);
                let fileType = checkFiletype(file);
                // console.log(fileType);

                const filedata = {
                    fileName: file,
                    originalName: file.split('-').splice(1).join('-'),
                    path: "/uploads/" + file,
                    size: (stats.size / 1024).toFixed(2) + "KB",
                    createdAt: stats.birthtime.toLocaleString(),
                    modifiedAt: stats.mtime.toLocaleString(),
                    fileType: fileType,
                }

                filesdata.push(filedata);
            })

            // return res.status(200).json({
            //     success: true,
            //     message: "Files fetched",
            //     data: filesdata,
            // });

            return res.render("Home", { data: filesdata });

        });
    } catch (err) {
        console.log('Error Occurred While Fetching files', err);
        return res.status(501).json({
            success: false,
            message: "Server Error",
            error: err,
        });
    }
})

app.listen(PORT, () => {
    console.log(`SERVER LISTEN ON ${PORT}`);
});