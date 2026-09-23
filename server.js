require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fail fast (in the logs) if the env vars are missing, instead of failing
// silently the first time someone submits the form.
if (!process.env.SMTP_LOGIN || !process.env.SMTP_PASSW) {
  console.warn(
    'WARNING: SMTP_LOGIN and/or SMTP_PASSW are not set. Emails will fail to send.'
  );
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSW,
  },
});

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill out every field.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_LOGIN,
      to: process.env.SMTP_LOGIN, // sends to your own inbox
      replyTo: email,
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    res.json({ success: true });
  } catch (err) {
    // Log the real error on the server so it shows up in Render's logs.
    console.error('Nodemailer error:', err);
    res.status(500).json({ error: 'Email failed to send. Check server logs.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
