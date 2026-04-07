import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("database.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'patient',
    verified INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS otps (
    email TEXT PRIMARY KEY,
    otp TEXT,
    expiresAt INTEGER
  );
`);

// Migration: Add 'role' column if it doesn't exist
const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const hasRole = tableInfo.some(col => col.name === 'role');
if (!hasRole) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'patient'");
}

// Create admin user if not exists (Javascript logic)
const checkAdmin = db.prepare("SELECT * FROM users WHERE email = 'admin@patientx.com'").get();
if (!checkAdmin) {
  db.prepare("INSERT INTO users (fullName, email, password, role, verified) VALUES ('Intelligence Admin', 'admin@patientx.com', 'admin123', 'admin', 1)").run();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cors());


  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const sendEmail = async (options: any) => {
    if (!process.env.EMAIL_USER && !process.env.EMAIL_PASS && !options.to) {
      console.warn("Email credentials or recipient missing. Email will not be sent.");
      return { success: true, message: "Email skipped" };
    }
    return transporter.sendMail(options);
  };

  // --- NOTIFY ORGANIZER ---
  app.post('/api/notify-organizer', async (req, res) => {
    const { organizerEmail, eventName, participant, amount } = req.body;
    const ticketId = "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const mailOptions = {
      from: `"Patient-X Pharmacy" <${process.env.EMAIL_USER || "g2312093@gmail.com"}>`,
      to: organizerEmail || "g2312093@gmail.com",
      subject: `New Purchase: ${eventName} - ${participant.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h3 style="color: #0ea5e9;">New Order Received</h3>
          <p><strong>Items:</strong> ${eventName}</p>
          <p><strong>Order ID:</strong> ${ticketId}</p>
          <hr />
          <h4>Customer Details:</h4>
          <ul>
            <li><strong>Name:</strong> ${participant.name}</li>
            <li><strong>Email:</strong> ${participant.email}</li>
          </ul>
          <p><strong>Amount Paid:</strong> ₹${amount}</p>
        </div>
      `
    };

    try {
      await sendEmail(mailOptions);
      res.status(200).json({ message: 'Organizer notified successfully', ticketId });
    } catch (error) {
      console.error('Error sending organizer email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // --- SEND TICKET/CONFIRMATION TO PARTICIPANT ---
  app.post('/api/send-ticket', async (req, res) => {
    const { participantEmail, eventName, participantName, ticketId, pdfBase64 } = req.body;

    const mailOptions = {
      from: `"Patient-X Support" <${process.env.EMAIL_USER || "g2312093@gmail.com"}>`,
      to: participantEmail,
      subject: `Order Confirmation for ${eventName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0ea5e9;">Order Confirmed!</h2>
          <p>Hi ${participantName},</p>
          <p>Thank you for your purchase at <strong>Patient-X Pharmacy</strong>.</p>
          <p>Your Order ID is: <strong>${ticketId}</strong></p>
          <p>We have received your payment of ₹1. Your items will be dispatched shortly.</p>
          <br />
          <p>Best Regards,<br/>Patient-X Team</p>
        </div>
      `,
      attachments: pdfBase64 ? [
        {
          filename: `Receipt-${ticketId}.pdf`,
          content: pdfBase64.split("base64,")[1],
          encoding: 'base64'
        }
      ] : []
    };

    try {
      await sendEmail(mailOptions);
      res.status(200).json({ message: 'Confirmation sent successfully' });
    } catch (error) {
      console.error('Error sending ticket email:', error);
      res.status(500).json({ error: 'Failed to send confirmation' });
    }
  });

  // Auth Routes
  app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const upsertOtp = db.prepare("INSERT OR REPLACE INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)");
    upsertOtp.run(email, otp, expiresAt);

    const mailOptions = {
      from: process.env.EMAIL_USER || "g2312093@gmail.com",
      to: email,
      subject: "OTP Code for Patient-X Pharmacy",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #0ea5e9; text-align: center;">Patient-X Verification</h2>
          <p>Hello,</p>
          <p>Your verification code for registration is:</p>
          <div style="background: #f0f9ff; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="letter-spacing: 10px; color: #0ea5e9; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    try {
      console.log(`Sending verification to ${email} using ${process.env.EMAIL_USER}`);
      await sendEmail(mailOptions);
      console.log("Email sent successfully!");
      res.json({ success: true });
    } catch (err: any) {
      console.error("NODEMAILER ERROR:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to send 2FA" });
    }
  });

  app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const row = db.prepare("SELECT * FROM otps WHERE email = ?").get(email) as any;

    if (row && row.otp === otp && row.expiresAt > Date.now()) {
      db.prepare("DELETE FROM otps WHERE email = ?").run(email);
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  });

  app.post("/api/register", (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
      // Use INSERT OR REPLACE so repeated attempts don't fail
      const insert = db.prepare("INSERT OR REPLACE INTO users (fullName, email, password, role, verified) VALUES (?, ?, ?, 'patient', 1)");
      insert.run(fullName, email, password);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Registration error:", err.message);
      res.status(400).json({ success: false, message: err.message || "Registration failed" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ success: true, user: { name: user.fullName || user.email, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/predict-fraud", async (req, res) => {
    const { amount, bankDetails, behavioralContext } = req.body;
    const { spawn } = await import("child_process");

    const hour = new Date().getHours();

    // Build enriched payload with behavioral signals
    const payload = {
      amount,
      bankDetails,
      transaction_hour:    hour,
      is_new_device:       behavioralContext?.isNewDevice    ?? 0,
      is_new_location:     behavioralContext?.isNewLocation  ?? 0,
      txn_last_5min:       behavioralContext?.txnVelocity    ?? 1,
      avg_user_amount:     behavioralContext?.avgAmount      ?? 500,
      account_age_days:    behavioralContext?.accountAgeDays ?? 180,
      past_fraud_count:    behavioralContext?.pastFraudCount ?? 0,
    };

    const scriptPath = path.join(process.cwd(), "..", "predict_single.py");
    const pythonProcess = spawn("python", [scriptPath]);

    let dataString = "";

    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pythonProcess.on("close", (code) => {
      try {
        const result = JSON.parse(dataString);
        if (result.error) {
          throw new Error(result.error);
        }
        res.json(result);
      } catch (err) {
        console.error("Python Error:", err, dataString);
        // Fallback to mock if python fails
        const mockTotal = Math.random();
        res.json({
          ensemble_score: mockTotal,
          risk_level: mockTotal > 0.7 ? "HIGH RISK" : mockTotal > 0.4 ? "MEDIUM RISK" : "LOW RISK",
          fraud_prediction: mockTotal > 0.5 ? 1 : 0,
          models: {
            iso: mockTotal * 0.8,
            rf: mockTotal * 1.1,
            svm: mockTotal * 0.9,
            xgb: mockTotal * 1.2
          }
        });
      }
    });
  });

  // --- FRAUD DETECTION API ---
  app.get("/api/fraud-results", async (req, res) => {
    try {
      const fs = await import("fs");
      const csvPath = path.join(process.cwd(), "..", "fraud_ensemble_results.csv");
      if (fs.existsSync(csvPath)) {
        const fileContent = fs.readFileSync(csvPath, "utf-8");
        const lines = fileContent.trim().split("\n");
        const headers = lines[0].split(",");
        const results = lines.slice(1, 101).map(line => { // Limiting to first 100 for now
          const values = line.split(",");
          const obj: any = {};
          headers.forEach((h, i) => obj[h] = values[i]);
          return obj;
        });
        res.json(results);
      } else {
        res.status(404).json({ error: "Fraud results file not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to read fraud results" });
    }
  });

  // Vite dev middleware comes LAST so all API routes take priority
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { port: 24700 }  // Use custom port to avoid conflicts
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
