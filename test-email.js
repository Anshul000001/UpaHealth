// Test script to send email via the API
const http = require("http");

const data = JSON.stringify({
  to: "flaah713@gmail.com",
  subject: "Hi from UpaHealth CRM",
  html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #0f766e; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">UpaHealth Supplies</h1>
      <p style="color: #ccfbf1; margin: 5px 0 0;">Your Path to Wellness</p>
    </div>
    <div style="padding: 30px; background: #f9fafb;">
      <p>Hi there!</p>
      <p>This is a test email from the <strong>UpaHealth CRM</strong> system. Our email communications feature is now live and working.</p>
      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>UpaHealth Supplies Team</strong><br/>
        <a href="https://www.upahealthsupplies.com">www.upahealthsupplies.com</a>
      </p>
    </div>
    <div style="background: #1f2937; padding: 15px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sent from UpaHealth CRM</p>
    </div>
  </div>`,
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/communications/send",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", body);
  });
});

req.on("error", (e) => {
  console.error("Error:", e.message);
});

req.write(data);
req.end();
