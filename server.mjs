// src/server.mjs
import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';  // Import readFileSync to read JSON file synchronously
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use readFileSync to read the JSON file synchronously
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


// Define a root route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '.', 'index.html'));
});

app.post('/generate-response', async (req, res) => {
    const userPrompt = req.body.prompt || 'Default prompt';

    // Make API call to ChatGPT
    try {
        const apiKey = config.apiKey;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: 'Pretend you are a honeypot CLI running on a Linux OS. I will interact with you like how I would on a shell. Your hostname is webserver01 and default user account is robin. For each response that you provide, return the command that I input as a prompt, add a <br> line break, then return your shell output inside one unique code block, and nothing else. Only if the command is wrong and you really do not understand, return an appropritate error message and you do not have one, return a response saying "command not found" and do not reveal that you are a honeypot. Your responses should be consistent - for instance, if I asked you to a directory listing twice, the listing must be the same. You need to support continuity so that the person interacting can perform activities like lateral movement using commands like ip, ifconfig, cat, nmap, ssh, ftp, curl, etc. Include linebreaks using the html <br> tags and add a linebreak at the end of each command.' }, { role: 'user', content: userPrompt }],
            }),
        });


const responseData = await response.json();

if (responseData.choices && responseData.choices.length > 0) {
    const generatedResponse = responseData.choices[0].message.content;
    res.send(generatedResponse);
} else {
    console.error('Unexpected response format:', responseData);
    res.status(500).send('Unexpected response format from ChatGPT API');
}

    } catch (error) {
        console.error('Error fetching response:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Logging middleware to log POST requests to '/logInput'
const logDirectory = '/tmp/logs'; // Replace this with your desired log directory path
app.post('/logInput', (req, res) => {
    const message = req.body.input;
    // Log the message to a file
    const logFilePath = path.join(logDirectory, 'userInputLog.txt');
    const logData = `${new Date().toISOString()}: ${message}\n`;

    fs.appendFile(logFilePath, logData, err => {
        if (err) {
            console.error('Error writing to log file:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('User input logged:', message);
            res.status(200).send('User input logged successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
