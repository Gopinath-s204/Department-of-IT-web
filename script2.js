function handleSubmit(e) {
    e.preventDefault();
    // Add form submission logic here
    alert('Form submitted successfully! Data can only be viewed by authorized staff.');
    e.target.reset();
    return false;
}

function showAdminLogin() {
    new bootstrap.Modal(document.getElementById('adminModal')).show();
}

function checkAdminPassword() {
    const password = prompt('Enter admin password:');
    // In real implementation, use secure server-side authentication
    if(password === '2022info2025') {
        alert('Access granted! Redirecting to records...');
        // Add redirection to admin view
    } else {
        alert('Invalid password! Access denied.');
    }
}

// Add animation to form container on scroll
window.addEventListener('scroll', () => {
    const form = document.querySelector('.form-container');
    const scrollPosition = window.scrollY;
    form.style.transform = `translateY(${scrollPosition * 0.1}px)`;
});
// Add this JavaScript to handle file upload changes
document.addEventListener('DOMContentLoaded', function() {
document.querySelectorAll('.upload-box input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        const parentLabel = this.closest('.upload-box');
        if (this.files && this.files.length > 0) {
            parentLabel.classList.add('upload-success');
        } else {
            parentLabel.classList.remove('upload-success');
        }
    });
});
});



    // Add this JavaScript after existing functions
    document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function(e) {
        const label = this.closest('.upload-box');
        const fileNameDisplay = label.querySelector('.file-name') || document.createElement('span');
        
        if (this.files.length > 0) {
            // Add success styling
            label.classList.add('upload-success');
            // Create/show file name display
            fileNameDisplay.className = 'file-name d-block mt-1';
            fileNameDisplay.textContent = this.files[0].name;
            if (!label.contains(fileNameDisplay)) {
                label.appendChild(fileNameDisplay);
            }
        } else {
            // Remove success styling
            label.classList.remove('upload-success');
            fileNameDisplay.remove();
        }
    });
});
 

 document.getElementById("studentForm").addEventListener("submit", async function(event) {
event.preventDefault();

const formData = new FormData(this);

const response = await fetch("http://127.0.0.1:3000/", {
method: "POST",
body: formData
});

const result = await response.json();
alert(result.message);
});

app.post("/register", upload.fields([
{ name: "passportPhoto" }, { name: "aadhar" }, { name: "income" }, 
{ name: "community" }, { name: "birth" }, { name: "transfer" }, { name: "marksheet" }
]), (req, res) => {
const { studentName, fatherName, motherName, dob, studentPhone, parentPhone, address } = req.body;
const files = req.files;

const sql = "INSERT INTO students (studentName, fatherName, motherName, dob, studentPhone, parentPhone, address, passportPhoto, aadhar, income, community, birth, transfer, marksheet) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

db.query(sql, [
studentName, fatherName, motherName, dob, studentPhone, parentPhone, address,
files.passportPhoto[0].filename, files.aadhar[0].filename, files.income[0].filename, 
files.community[0].filename, files.birth[0].filename, files.transfer[0].filename, files.marksheet[0].filename
], (err, result) => {
if (err) {
console.error(err);
return res.json({ message: "Database error" });
}
res.json({ message: "Registration successful!" });
});
});


function checkAdminPassword() {
    const password = prompt('Enter admin password:');
    
    if (password === '2022info2025') {
        alert('Access granted! Redirecting to student records...');
        window.location.href = 'list.html'; // Redirects to list.html
    } else {
        alert('Invalid password! Access denied.');
    }
}








document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.upload-box input[type="file"]').forEach(input => {
        input.addEventListener("change", function() {
            const file = this.files[0];
            const maxSize = 1 * 1024 * 1024; // 1MB in bytes
            const parentLabel = this.closest(".upload-box");
            let fileNameDisplay = parentLabel.querySelector(".file-name");

            if (!fileNameDisplay) {
                fileNameDisplay = document.createElement("span");
                fileNameDisplay.className = "file-name d-block mt-1";
                parentLabel.appendChild(fileNameDisplay);
            }

            if (file) {
                if (file.size > maxSize) {
                    alert("❌ File size exceeds 1MB! Please upload a smaller file.");
                    this.value = ""; // Clear the input field
                    parentLabel.classList.remove("upload-success");
                    fileNameDisplay.textContent = ""; // Clear file name display
                } else {
                    // Add success styling
                    parentLabel.classList.add("upload-success");
                    fileNameDisplay.textContent = `✅ ${file.name}`;
                }
            } else {
                parentLabel.classList.remove("upload-success");
                fileNameDisplay.textContent = "";
            }
        });
    });
});
