import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
const ai = new GoogleGenAI({});

app.use(cors());
//app.use(multer());
app.use(express.json());

app.listen(3000, () => {
    console.log("Successfully Run App at Port: 3000");
});

app.post(
    '/chat', 
    async (req, res) => {
        const { body } = req;
        const { prompt } = body;

        if(!prompt || typeof prompt !== 'string'){
            res.status(400).json({
                message: "Prompt harus diisi dan berupa string.",
                data: null,
                success: false
            });
            return;
        }

        try {
            const aiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { parts : [
                        { text: prompt }
                    ] }
                ]
            });

            res.status(200).json({
                message: "Berhasil ditanggapi Google Gemini Flash!",
                data: aiResponse.text,
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