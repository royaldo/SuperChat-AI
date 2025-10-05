import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

app.use(cors());
//app.use(multer());
app.use(express.json());
app.use(express.static('public'));

app.listen(3000, () => {
    console.log("Successfully Run App at Port: 3000");
});

app.post(
    '/chat', 
    async (req, res) => {
        const { body } = req;
        const { history, message } = body;

        if(!history || !Array.isArray(history) || !message || typeof message !== 'string'){
            res.status(400).json({
                message: "Invalid request body. 'history' (array) and 'message' (string) are required.",
                data: null,
                success: false
            });
            return;
        }

        try {
            // Combine the history and the new message into the format generateContent expects
            const contents = [
                ...history,
                { role: 'user', parts: [{ text: message }] }
            ];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
            });
            const text = response.text;

            res.status(200).json({
                message: "Berhasil ditanggapi Google Gemini Flash!",
                data: text,
                success: true
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: e.message || "Ada masalah di server.",
                data: null,
                success: false
            })
        }
    });