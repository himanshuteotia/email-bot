require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded" });
  }

  fs.readFile(req.file.path, "utf8")
    .then((data) => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = [...new Set(data.match(emailRegex))];

      if (!emails || emails.length === 0) {
        return res.status(400).json({ error: "No valid emails found" });
      }

      res.json({ emails });
    })
    .catch((err) => {
      console.error("Error reading file:", err);
      res.status(500).json({ error: "Error reading the file" });
    });
});

app.post("/send", upload.single("attachment"), async (req, res) => {
  const { subject, content, emails } = req.body;
  const emailList = JSON.parse(emails);
  const attachment = req.file;

  try {
    await sendEmails(emailList, subject, content, attachment);

    if (attachment) {
      await fs.unlink(attachment.path);
    }

    const uploadsDir = path.join(__dirname, "uploads");
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      await fs.unlink(path.join(uploadsDir, file));
    }

    res.send(`${emailList.length} emails have been sent successfully`);
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).send("There was a problem sending the emails");
  }
});

async function sendEmails(emailList, subject, content, attachment) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    subject: subject,
    text: content,
  };

  if (attachment) {
    mailOptions.attachments = [
      {
        filename: attachment.originalname,
        path: attachment.path,
      },
    ];
  }

  for (const email of emailList) {
    mailOptions.to = email;
    await transporter.sendMail(mailOptions);
  }
}

const uploadsDir = "./uploads";

// Use fs.promises.access to check if the directory exists
fs.access(uploadsDir)
  .catch(() => fs.mkdir(uploadsDir))
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Error creating uploads directory:", err);
    process.exit(1);
  });
