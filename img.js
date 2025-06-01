const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    const fileUrl = `http://localhost:${5000}/uploads/${req.file.filename}`;
    res.json({ message: "File uploaded successfully!", url: fileUrl });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${5000}`);
});




// // Login Page
// app.get("/", (req, res) => {
//     if (req.url === "/") {
//       res.render("Img-gallery.html")
//     }
//   });




//   // Set 'views' directory and specify HTML as a view engine
// app.set('views', path.join(__dirname, 'Img-gallery.html'));
// app.engine('html', require('ejs').renderFile);  // ✅ Use EJS to render HTML
// app.set('view engine', 'html');


app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Img-gallery.html'));
});

app.listen(5000, () => console.log('Server running on port 3000'));