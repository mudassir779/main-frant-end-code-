import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
// Note: Hostinger will provide the API key via environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// API Route for Chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // System prompt to define the bot's personality
        const systemPrompt = `You are Abdias, a professional Tree Specialist from American Tree Experts.
    - You are helpful, knowledgeable, and friendly.
    - You specialize in tree trimming, removal, stump grinding, and health assessments.
    - Your goal is to help customers and encourage them to schedule a free assessment.
    - If asked about prices, give a rough estimate ($500-$2000) but emphasize that an on-site assessment is needed for accuracy.
    - Keep responses concise and conversational.
    - If the user seems ready to book, ask for their name and phone number.
    - Company Phone: 812-457-3433.`;

        // Prepare messages for OpenAI
        // We include a simplified history to maintain context
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-5).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access and budget
            messages: messages,
            max_tokens: 150,
            temperature: 0.7,
        });

        const botResponse = completion.choices[0].message.content;

        res.json({ response: botResponse });

    } catch (error) {
        console.error('Error calling OpenAI:', error);
        res.status(500).json({
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
});

// Serve static files from the React build (dist folder)
// This handles the frontend delivery
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
