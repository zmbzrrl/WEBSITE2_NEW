import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
	res.json({ ok: true, time: new Date().toISOString() });
});

// Init Supabase service client
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
export const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

// Email transport (Nodemailer; for SendGrid, use SMTP or API transport)
let transporter;
if (process.env.EMAIL_API_KEY) {
	// Default to SendGrid SMTP via nodemailer
	transporter = nodemailer.createTransport({
		host: 'smtp.sendgrid.net',
		port: 587,
		secure: false,
		auth: {
			user: 'apikey',
			pass: process.env.EMAIL_API_KEY
		}
	});
}

app.post('/notify', async (req, res) => {
	try {
		const { to, subject, text } = req.body || {};
		if (!to || !subject || !text) {
			return res.status(400).json({ error: 'Missing required fields: to, subject, text' });
		}

		if (!transporter) {
			return res.status(500).json({ error: 'Email transport not configured' });
		}

		const from = process.env.EMAIL_FROM || 'no-reply@example.com';
		await transporter.sendMail({ from, to, subject, text });

		return res.json({ success: true });
	} catch (err) {
		console.error('Notify error:', err);
		return res.status(500).json({ error: 'Internal error' });
	}
});

app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});
