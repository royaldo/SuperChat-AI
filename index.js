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
app.use(express.static('public'));

app.listen(3000, () => {
    console.log("Successfully Run App at Port: 3000");
});

app.post(
    '/chat', 
    async (req, res) => {
        const { body } = req;
        const { conversation } = body;

        if(!conversation || !Array.isArray(conversation)){
            res.status(400).json({
                message: "Percakapan harus valid.",
                data: null,
                success: false
            });
            return;
        }

        const conversationIsValid = conversation.every((message) => {
            if(!message) return false;
            if(typeof message !== 'object' || Array.isArray(message)) return false;
            const keys = Object.keys(message);
            const keyLengthIsValid = keys.length === 2;
            const keyContainsValidName = keys.every(key => ['role', 'text'].includes(key));

            if(!keyLengthIsValid || !keyContainsValidName) return false;

            const { role, text } = message;
            const roleIsValid = ['user', 'text'].includes(role);
            const textIsValid = typeof text === 'string';

            if(!roleIsValid || !textIsValid) return false;

            return true;
        });

        if(!conversationIsValid){
            res.status(400).json({
                message: "Percakapan harus valid.",
                data: null,
                success: false
            });
            return;
        }

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{text}]
        }));

        try {
            const aiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents
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