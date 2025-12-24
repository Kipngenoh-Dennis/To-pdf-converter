require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temp storage

app.use(cors()); // Allow Frontend to talk to Backend

// THE ENDPOINT
app.post('/convert', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const inputPath = req.file.path;
    
    try {
        console.log(`1. Received file: ${req.file.originalname}`);

        // --- STEP A: Prepare Data for pdfRest ---
        // const formData = new FormData();
        // formData.append('file', fs.createReadStream(inputPath));
        // formData.append('output', 'example_out'); 
        // old code

        const formData =new FormData();

        // Ensure you explicitly pass the original filename so that pdfrest knows the file type
        formData.append('file', fs.createReadStream(inputPath), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        formData.append('output', 'example_out');
        
        // --- STEP B: Send to pdfRest API ---
        console.log("2. Sending to pdfRest...");
        const apiResponse = await axios.post('https://api.pdfrest.com/pdf', formData, {
            headers: {
                'Api-Key': process.env.PDF_REST_API_KEY,
                ...formData.getHeaders() // Crucial for multipart forms
            }
        });

        // --- STEP C: Get the Download URL ---
        const downloadUrl = apiResponse.data.outputUrl;
        console.log(`3. Conversion done. Fetching PDF from: ${downloadUrl}`);

        // --- STEP D: Download the actual PDF binary ---
        const pdfResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

        // --- STEP E: Send Final PDF to User ---
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
        res.send(pdfResponse.data);
        console.log("4. PDF sent to client!");

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(500).send("Conversion Failed");
    } finally {
        // Cleanup temp file
        fs.unlink(inputPath, () => {}); 
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));