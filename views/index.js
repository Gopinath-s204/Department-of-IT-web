const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set View Engine
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

// Database Connection
const db = mysql.createConnection({
  host: process.env.HOST || "127.0.0.1",
  user: process.env.DB_USERNAME || "HP",
  password: process.env.DB_PASSWORD || "6122004",
  database: process.env.DATABASE || "stud",
  port: process.env.PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Database Connection Failed!", err);
    process.exit(1); // Stop the server if DB fails
  }
  console.log("MySQL Connected...");
});

// **API: Get Student Data**
app.get("/api/students", (req, res) => {
  const query = `SELECT * FROM student1`;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const studentRollNo = req.body.studentRollNo;
    if (!studentRollNo) {
      return cb(new Error("Student Roll Number is required"));
    }

    // Create directory if it doesn't exist
    const uploadPath = path.join(__dirname, "uploads", studentRollNo);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Save with original filename
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Student Registration Endpoint
app.post(
  "/register",
  upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "aadharcertificate", maxCount: 1 },
    { name: "IncomeCertificate", maxCount: 1 },
    { name: "CommunityCertificate", maxCount: 1 },
    { name: "BirthCertificate", maxCount: 1 },
    { name: "transferCertificate", maxCount: 1 },
    { name: "TwelethMark", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const {
        studentRollNo,
        studentName,
        fatherName,
        motherName,
        dob,
        umisNumber,
        studentPhone,
        parentPhone,
        address,
      } = req.body;

      // Validate required fields
      if (
        !studentRollNo ||
        !studentName ||
        !umisNumber ||
        !studentPhone ||
        !parentPhone
      ) {
        return res
          .status(400)
          .json({ error: "All required fields must be filled!" });
      }

      // Prepare document paths
      const documents = {};
      const fileFields = [
        "passportPhoto",
        "aadharcertificate",
        "IncomeCertificate",
        "CommunityCertificate",
        "BirthCertificate",
        "transferCertificate",
        "TwelethMark",
      ];

      fileFields.forEach((field) => {
        if (req.files[field]) {
          documents[field] = path.join(
            studentRollNo,
            req.files[field][0].filename
          );
        }
      });

      // Insert into database
      const sql = `INSERT INTO student1 
        (studentRollNo, studentName, fatherName, motherName, dob, 
         umisNumber, studentPhone, parentPhone, address,
         passportPhoto, aadharcertificate, IncomeCertificate, 
         CommunityCertificate, BirthCertificate, transferCertificate, TwelethMark) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [
          studentRollNo,
          studentName,
          fatherName,
          motherName,
          dob,
          umisNumber,
          studentPhone,
          parentPhone,
          address,
          documents.passportPhoto || null,
          documents.aadharcertificate || null,
          documents.IncomeCertificate || null,
          documents.CommunityCertificate || null,
          documents.BirthCertificate || null,
          documents.transferCertificate || null,
          documents.TwelethMark || null,
        ],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            // Clean up uploaded files if DB fails
            if (req.files) {
              Object.values(req.files).forEach((fileArray) => {
                fileArray.forEach((file) => {
                  fs.unlinkSync(file.path);
                });
              });
            }
            return res.status(500).json({ error: "Database error occurred" });
          }
          // res.json({ message: "Student registered successfully!" });
          res.json({ success: true, message: "Registered successfully" });
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.put("/api/students/:rollNo", (req, res) => {
  const { rollNo } = req.params;
  console.log(`Received update request for roll number: ${rollNo}`); // Debugging Log

  const sql = `UPDATE student1 
               SET studentname=?, fathername=?, mothername=?, dob=?, umisnumber=?, studentphone=?, parentphone=?, address=? 
               WHERE studentrollno=?`;

  const {
    studentName,
    fatherName,
    motherName,
    dob,
    umisNumber,
    studentPhone,
    parentPhone,
    address,
  } = req.body;

  db.query(
    sql,
    [
      studentName,
      fatherName,
      motherName,
      dob,
      umisNumber,
      studentPhone,
      parentPhone,
      address,
      rollNo,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database update failed" });
      }
      if (result.affectedRows === 0) {
        console.log(`No student found with roll number: ${rollNo}`);
        return res.status(404).json({ error: "Student not found" });
      }
      console.log(`Student ${rollNo} updated successfully`);
      res.json({ success: true, message: "Student updated successfully" });
    }
  );
});

app.delete("/api/students/:rollNo", (req, res) => {
  const rollNo = req.params.rollNo;

  const sql = "DELETE FROM student1 WHERE studentrollno = ?";

  db.query(sql, [rollNo], (err, result) => {
    if (err) {
      console.error("❌ Database delete error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Database error occurred" });
    }

    if (result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "✅ Student deleted successfully!",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Student not found!" });
    }
  });
});

//  Image gallery
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const eventName = req.body.event_name; // Ensure this field is sent
    if (!eventName) {
      return cb(new Error("Event Name is required"));
    }
    const uploadPath = `uploads/events/${eventName}`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const eventUpload = multer({ storage: eventStorage });

// ✅ Event Upload API
app.post("/api/events", eventUpload.array("files", 10), (req, res) => {
  const { event_name, event_date, event_description } = req.body;
  const folder_name = `uploads/events/${event_name}`;

  db.query(
    "INSERT INTO events (event_name, event_date, event_description, folder_name) VALUES (?, ?, ?, ?)",
    [event_name, event_date, event_description, folder_name],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: "🎉 Event Uploaded Successfully!" });
    }
  );
});

app.get("/api/events/:event_name/media", (req, res) => {
  const eventName = req.params.event_name;
  const folderPath = path.join(__dirname, "uploads", "events", eventName);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: "Event folder not found" });
  }

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return res.status(500).json({ error: "Unable to read files" });
    }
    const mediaFiles = files.map(
      (file) => `/uploads/events/${eventName}/${file}`
    );
    res.json(mediaFiles);
  });
});

// 🔹 Fetch All Events
app.get("/api/events", (req, res) => {
  db.query("SELECT * FROM events", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.delete("/api/events/:id", (req, res) => {
  console.log(req.params);
  const eventId = req.params.id;
  console.log("eventId", eventId);

  // 1️⃣ First, check if the event exists
  db.query(
    "SELECT * FROM events WHERE event_id = ?",
    [eventId],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      const event = results[0];
      const folderPath = path.join(__dirname, event.folder_name);

      // 2️⃣ Delete the event folder (if it exists)
      if (fs.existsSync(folderPath)) {
        fs.rm(folderPath, { recursive: true }, (err) => {
          if (err) {
            console.error("Error deleting event folder:", err);
            return res.status(500).json(err);
          }

          // 3️⃣ Delete from database
          db.query(
            "DELETE FROM events WHERE event_id = ?",
            [eventId],
            (err) => {
              if (err) {
                return res.status(500).json(err);
              }
              res.json({
                success: true,
                message: "Event deleted successfully!",
              });
            }
          );
        });
      } else {
        // If folder doesn't exist, just delete from DB
        db.query("DELETE FROM events WHERE event_id = ?", [eventId], (err) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.json({ success: true, message: "Event deleted successfully!" });
        });
      }
    }
  );
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure storage
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('i am in multi storeage')
    console.log("sdsdssd", req);
    // FIXME request body not coming year and subject not available in request
    let year = req.body.year;
    let subject = req.body.subject;
    let dir = `uploads/materials/${year}/${subject}`;
    console.log('ditrectory', dir)
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {      
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
// const materialStorage = multer.memoryStorage();
const materialUpload = multer({
  storage: materialStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ✅ Fix 2: Explicit POST route for uploads
app.post("/api/materials", materialUpload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    let year = req.body.year;
    let subject = req.body.subject;
    // let dir = `uploads/materials/${year}/${subject}`;
    // fs.mkdirSync(dir, { recursive: true });
    // console.log("nbody", req.body);
    let filePath = `/uploads/materials/${year}/${subject}/${req.file.filename}`;
    // if (!fs.existsSync(uploadPath)) {
    //   fs.mkdirSync(uploadPath, { recursive: true });
    // }
    // const filePath = path.join(uploadPath, req.file.originalname);
    // console.log("-------", req.file);
    // // console.log("-------", req.file.buffer);
    // console.log("-------", req.file.originalname);
    // console.log("-------", req.file.filename);
    // try {
    //   fs.writeFileSync(filePath, req.file.buffer, (err) => {
    //     if (err) {
    //       console.error("Error writing file:", err);
    //       return res.status(500).json({ error: "File write failed!" });
    //     }
    //     console.log("File saved successfully:", filePath);
    //   });
    // } catch (error) {
    //   console.log("File Creation Error", error);
    // }
    console.log("_____", year, subject, uploadPath+ `/${req.file.filename}`, "_____");

    // Insert into database (example using your existing db connection)
    db.query(
      "INSERT INTO study_materials (year, subject, file_name, file_path) VALUES (?, ?, ?, ?)",
      [
        year,
        subject,
        req.file.originalname,
        filePath,
      ],
      (err) => {
        if (err) {
          fs.unlinkSync(req.file.path); // Clean up on error
          return res.status(500).json(err);
        }
        res.json({
          success: true,
          message: "File uploaded successfully!",
          path: filePath,
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

// Serve static files
app.use(
  "/uploads/materials",
  express.static(path.join(__dirname, "uploads/materials"))
);

// API to fetch subject based on year
app.get("/api/subjects/:year/", (req, res) => {
  const { year } = req.params;
  const directoryPath = path.join(__dirname, "uploads/materials", year);

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(files);
  });
});

// API to fetch files based on year and subject
app.get("/api/subjects/:year/:subject", (req, res) => {
  // console.log("i am inn");
  // console.log(req.params);
  // console.log(req.body);
  const { year, subject } = req.params;
  const directoryPath = path.join(
    __dirname,
    "uploads/materials",
    year,
    subject
  );

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(files);
  });
});

// Serve static files
app.use(
  "/uploads/materials",
  express.static(path.join(__dirname, "uploads/materials"))
);

// API to fetch subjects for a given year
app.get("/api/subjects/:year", (req, res) => {
  const { year } = req.params;
  const directoryPath = path.join(__dirname, "uploads/materials", year);

  fs.readdir(directoryPath, (err, subjects) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Unable to fetch subjects. Directory may not exist." });
    }
    res.json(
      subjects.filter((subject) =>
        fs.statSync(path.join(directoryPath, subject)).isDirectory()
      )
    );
  });
});

// API to fetch files based on year
app.get("/api/files/:year", (req, res) => {
  const { year } = req.params;
  const directoryPath = path.join(__dirname, "uploads/materials", year);

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Unable to fetch files. Directory may not exist." });
    }
    res.json(
      files.filter((file) =>
        fs.statSync(path.join(directoryPath, file)).isFile()
      )
    );
  });
});

// API to fetch files based on year and subject
app.get("/api/files/:year/:subject", (req, res) => {
  const { year, subject } = req.params;
  const directoryPath = path.join(
    __dirname,
    "uploads/materials",
    year,
    subject
  );

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Unable to fetch files. Directory may not exist." });
    }
    res.json(files);
  });
});

// ✅ Fix 3: Handle OPTIONS requests for CORS preflight
app.options("/api/materials", (req, res) => {
  res.sendStatus(200);
});

// **Login Page**
app.get("/", (req, res) => {
  res.render("index1.html");
});

// **List Page**
app.get("/list", (req, res) => {
  res.render("list.html");
});

// **List Page**
app.get("/login1", (req, res) => {
  res.render("login1.html");
});

// **List Page**
app.get("/About", (req, res) => {
  res.render("About.html");
});

// **List Page**
app.get("/Img-gallery", (req, res) => {
  res.render("Img-gallery.html");
});

// **List Page**
app.get("/sub-material", (req, res) => {
  res.render("sub-material.html");
});

// **List Page**
app.get("/Contact", (req, res) => {
  res.render("Contact.html");
});

app.get("*", (req, res) => {
  return res.sendStatus(404);
});

// **Start Server**
const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
