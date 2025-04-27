const multer = require('multer')
const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()
const { exec } = require('child_process');
const UPLOAD_FOLDER = "uploads";
const CONVERTED_FOLDER = "converted";

// Ensure folders exist
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
fs.mkdirSync(CONVERTED_FOLDER, { recursive: true });

router.use(express.static(path.join(__dirname, 'public')));
router.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_FOLDER)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
})
  
const upload = multer({ storage: storage })

const convert = (req, res) => { upload.single('file')(req, res, (err) => {
        
        if (!req.file) return res.status(400).send("No file uploaded.");
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const inputPath = path.join(__dirname, '..', UPLOAD_FOLDER, req.file.filename);

                if (fileExt == '.docx' || fileExt == '.doc') {
                    // Convert docx file to pdf using LibreOffice
                    docConvert(req, res, inputPath);
                } else if(fileExt == '.xls' || fileExt == '.xlsx') {
                    xlsConvert(req, res, inputPath);
                } else if(fileExt == '.ppt' || fileExt == '.pptx') {
                    pptConvert(req, res, inputPath);
                }else if(fileExt == '.txt') {
                   txtConvert(req, res, inputPath);
                } else {
                    return res.send('File format not accepted');
                }
    });
}

const docConvert=(req, res, inputPath)=>{

    const outputFilename = req.file.filename.replace(/\.docx?$/, ".pdf");
    const outputPath = path.join(__dirname, '..', CONVERTED_FOLDER, outputFilename);

    libreOfficeConverter(req, res, inputPath, outputPath);
   
}
const xlsConvert=(req, res, inputPath)=>{
    const outputFilename = req.file.filename.replace(/\.(xls|xlsx)$/, ".pdf");
    const outputPath = path.join(__dirname, '..', CONVERTED_FOLDER, outputFilename);

    libreOfficeConverter(req, res, inputPath, outputPath);
}
const pptConvert=(req, res, inputPath)=>{
    const outputFilename = req.file.filename.replace(/\.(pptx|ppt)$/, ".pdf");
    const outputPath = path.join(__dirname, '..', CONVERTED_FOLDER, outputFilename);

    libreOfficeConverter(req, res, inputPath, outputPath);
}
// const htmlConvert=(req, res, inputPath)=>{
// }
const txtConvert=(req, res, inputPath)=>{
    const outputFilename = req.file.filename.replace(/\.txt/, ".pdf");
    const outputPath = path.join(__dirname, '..', CONVERTED_FOLDER, outputFilename);

    libreOfficeConverter(req, res, inputPath, outputPath);
}

const libreOfficeConverter= async (req, res, inputPath, outputPath)=>{
        // Delete the DOCX file after conversion
        await exec(`soffice --headless --convert-to pdf "${inputPath}" --outdir "${CONVERTED_FOLDER}"`, (error, stdout, stderr) => {
            if (error) return res.status(500).send("Conversion failed.");
                fs.unlink(inputPath, (err) => {
                if (err) {
                    console.error("Error deleting file:", err);
                } else {
                    console.log(`Deleted: ${inputPath}`);
                }
            });
    
            res.download(outputPath, (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                } else {
                    fs.unlink(outputPath, (err) => {
                        if (err) console.error("Error deleting converted PDF:", err);
                        else {
                            console.log(`Deleted: ${outputPath}`);}
                    });
                }
            });


        });


}

module.exports = { convert, router };