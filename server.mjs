// src/server.mjs
import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';  // Import readFileSync to read JSON file synchronously
import * as fs from 'fs';
import useragent from 'express-useragent';
import readline from 'readline';
import { exec } from 'child_process';

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
app.use(useragent.express());

// Define a root route to serve the index.html file
app.get('/', (req, res) => {

if (req.useragent.isChrome) {

 res.sendFile(path.join(__dirname, '.', 'index.html'));
} else {
 res.sendFile(path.join(__dirname, '.', 'lndex.html'));

}
});

// Webhook endpoint to receive callbacks from the beacon
app.post('/webhook', (req, res) => {
    const beaconData = req.body; // Access the data sent by the beacon
    // Process the data as needed
    console.log('Received webhook payload:', beaconData);

    const beaconDir = '/var/log/dahn'; // Replace this with your desired log directory path

    const message = req.body.input;
    // Log the message to a file
    const beaconFilePath = path.join(beaconDir, 'beacon.txt');
    const beaconDataString = JSON.stringify(beaconData) + '\n\n';

    fs.appendFile(beaconFilePath, beaconDataString, err => {
        if (err) {
            console.error('Error writing to beacon file:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('User input logged:', message);
            res.status(200).send('User input logged successfully');
        }
    });
});
const conversationHistory = [];
app.post('/generate-response', async (req, res) => {
    const userPrompt = req.body.prompt || 'Default prompt';

    // Make API call to ChatGPT
    try {
        const apiKey = config.apiKey;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';

const initialPromptFilePath = 'initial_prompt.txt'; // Update the file path accordingly
        const initialPrompt = fs.readFileSync(initialPromptFilePath, 'utf8');

        // Check for keywords in the user prompt to determine action
        const keywordsToCheck = ['curl']; // Add your keywords here
        const detectedKeywords = [];
        keywordsToCheck.forEach(keyword => {
            if (userPrompt.includes(keyword)) {
                detectedKeywords.push(keyword);
            }
        });

        if (detectedKeywords.length > 0) {
            // Provide the predefined file for the user to download
            const filePath = 'testsendfile.txt'; 
            const fileName = ''; 
            res.sendFile(path.resolve(filePath), fileName);
            return;
        }
        // Constructing messages array with initial prompt
        const messages = [
            { role: 'system', content: initialPrompt }
        ];

        // Adding previous prompts and responses to the messages array
        conversationHistory.forEach(entry => {
            messages.push({ role: 'user', content: entry.prompt });
            messages.push({ role: 'system', content: entry.response });
        });

        // Adding the current user prompt to the messages array
        messages.push({ role: 'user', content: userPrompt });
        console.log(messages)
        console.log('--------------\n')
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`, // Correct interpolation
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
            }),
        });

        const responseData = await response.json();

        if (responseData.choices && responseData.choices.length > 0) {
            const generatedResponse = responseData.choices[0].message.content;
            
	// Log response to file
	fs.appendFile('/var/log/dahn/generated_response.txt', `${generatedResponse}\n`, (err) => {
        if (err) {
            console.error('Error logging response:', err);
        }
        });
	    // Storing the current prompt and generated response in the conversation history
            conversationHistory.push({ prompt: userPrompt, response: generatedResponse });
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
const logDirectory = '/var/log/dahn'; // Replace this with your desired log directory path
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

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace '*' with the appropriate domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Define a route to handle requests for /userInput
app.get('/dahn/userInput', async (req, res) => {
    try {
        // Read the contents of /var/log/dahn/userInputLog with utf8 encoding
        const userInputPath = '/var/log/dahn/userInputLog.txt';
        const userInputContent = await fs.promises.readFile(userInputPath, { encoding: 'utf8' });
        res.send(userInputContent);
    } catch (error) {
        console.error('Error reading userInputlog:', error);
        res.status(500).send('Failed to read userInputlog.');
    }
});

let parsedData = []; // Store parsed data globally



// Function to parse the text file
function parseTextFile(filePath) {
    return new Promise((resolve, reject) => {
        const newData = [];
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
	    if (line.trim() !== '') {
                try {
                    const data = JSON.parse(line);
                    newData.push(data);
                } catch (error) {
                    console.error('Error parsing line:', error);
	        }
            }
        });

        rl.on('close', () => {
            console.log('File parsing completed');
            parsedData = newData; // Update parsedData with the new data
            resolve();
        });

        rl.on('error', (error) => {
            console.error('Error reading file:', error);
            reject(error);
        });
    });
}

const filePath = '/var/log/dahn/beacon.txt'; // Updated with your file name
parseTextFile(filePath)
    .catch(error => console.error('Error parsing file:', error));

app.get('/dahn/beacon', (req, res) => {
    const { includeChannel, includeTokenType, includeSrcIp, includeToken, includeTime, includeMemo, includeAdditionalData } = req.query;

    // Default fields to include if no query parameters are provided
    const defaultFields = {
        src_ip: 'Source IP',
        time: 'Time',
        'additional_data.geo_info.city': 'City',
        'additional_data.geo_info.asn': 'ASN',
        'additional_data.useragent': 'User Agent'
    };

    // Ensure default fields are always included
    let fieldsToInclude = Object.keys(defaultFields);

    // If additional fields are requested, add them to the list of fields to include
    if (includeChannel) fieldsToInclude.push('channel');
    if (includeTokenType) fieldsToInclude.push('token_type');
    if (includeToken) fieldsToInclude.push('token');
    if (includeMemo) fieldsToInclude.push('memo');
    if (includeAdditionalData) fieldsToInclude.push('additional_data');

    let filteredData = parsedData.map(entry => {
        const filteredEntry = {};
        fieldsToInclude.forEach(field => {
            if (field.startsWith('additional_data')) {
                // Extract nested fields from additional_data object
                const nestedFields = field.split('.'); // Split the field by '.'
                let value = entry; // Initialize value to the entry object
                nestedFields.forEach(nestedField => {
                    // Traverse through nested fields to access the final value
                    value = value[nestedField];
                });
                filteredEntry[field] = value; // Assign the final value to the filtered entry
            } else {
                // For non-nested fields, simply copy the value
                filteredEntry[field] = entry[field];
            }
        });
        return filteredEntry;
    });

    let html = '<html><head><title>Beacon Data</title></head><body><h1>Beacon Data</h1><ul>';
    filteredData.forEach(entry => {
        html += '<li>';
        for (const key in entry) {
            if (key === 'additional_data') {
                html += `<strong>${key}:</strong> ${JSON.stringify(entry[key])}<br>`;
            } else if (key === 'additional_data.geo_info.asn') {
                // Display ASN field as formatted JSON
                html += `<strong>${defaultFields[key]}:</strong>${JSON.stringify(entry[key], null, 2)}<br>`;
            } else {
                html += `<strong>${defaultFields[key] || key}:</strong> ${entry[key]}<br>`;
            }
        }
        html += '</li>';
    });
    html += '</ul></body></html>';
    res.send(html);
});

// Function to read contents of a file
async function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Function to send text to GPT-3 API and get response
async function generateIntelResponse(prompt, userInput) {
    const apiKey = config.apiKey; // Replace with your OpenAI API key
    const url = 'https://api.openai.com/v1/chat/completions';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // GPT-3.5 turbo model
                messages: [
                    {
                        role: 'user',
                        content: userInput
                    },
                    {
                        role: 'assistant',
                        content: prompt
                    }
                ]
            })
        });
        const responseData = await response.json();
        return responseData.choices[0].message.content.trim().replace(/\n/g, '<br>');
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to generate response from GPT-3.5 API');
    }
}

// API endpoint to handle file upload and generate response
app.get('/dahn/intel', async (req, res) => {
    try {
        const userInput = await readFile('/var/log/dahn/userInputLog.txt');
	const prompt = await readFile('intel.txt');
        const response = await generateIntelResponse(prompt, userInput);
        const htmlResponse = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Intel</title>
            </head>
            <body>
                <h1>Intel</h1>
                <div>${response}</div>
            </body>
            </html>
        `;
        res.send(htmlResponse);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to clear the content of the file
function clearLogFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile('/var/log/dahn/userInputLog.txt', '', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Handle clear user input log request
app.get('/dahn/clear/userinputlog', async (req, res) => {
    try {
        await clearLogFile();
        res.status(200).send('User input log cleared successfully.');
    } catch (error) {
        console.error('Error clearing log file:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to clear the content of the file
function clearBeaconLogFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile('/var/log/dahn/beacon.txt', '', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Handle clear user input log request
app.get('/dahn/clear/beacon', async (req, res) => {
    try {
        await clearBeaconLogFile();
        parsedData = [];
        res.status(200).send('Beacon log cleared successfully.');
    } catch (error) {
        console.error('Error clearing log file:', error);
        res.status(500).send('Internal Server Error');
    }
});

const FingerprintLogPath = '/var/log/dahn/fingerprint.txt';
app.post('/store-fingerprint', (req, res) => {
    // Extract the fingerprint from the request body
    const fingerprint = req.body.fingerprint;

    // Append the fingerprint data to the log file
    fs.appendFile(FingerprintLogPath, fingerprint + '\n', (err) => {
        if (err) {
            console.error('Error storing fingerprint:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Fingerprint stored successfully:', fingerprint);
            res.status(200).json({ message: 'Fingerprint stored successfully' });
        }
    });
});

// Function to clear the content of the file
function clearFingerprintLogFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile('/var/log/dahn/fingerprint.txt', '', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Handle clear user input log request
app.get('/dahn/clear/fingerprintlog', async (req, res) => {
    try {
        await clearFingerprintLogFile();
        res.status(200).send('User input log cleared successfully.');
    } catch (error) {
        console.error('Error clearing log file:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route to handle requests for /fingerprint
app.get('/dahn/fingerprint', async (req, res) => {
    try {
        // Read the contents of /var/log/dahn/fingerprint with utf8 encoding
        const userInputPath = '/var/log/dahn/fingerprint.txt';
        const userInputContent = await fs.promises.readFile(userInputPath, { encoding: 'utf8' });
        
        // Construct HTML with title tag
        const htmlResponse = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Fingerprint</title>
            </head>
            <body>
		<h1>Fingerprint</h1>
                <pre>${userInputContent}</pre>
            </body>
            </html>
        `;

        // Send the HTML as the response
        res.send(htmlResponse);
    } catch (error) {
        console.error('Error reading userInputlog:', error);
        res.status(500).send('Failed to read userInputlog.');
    }
});

app.get('/dahn/adddb', (req, res) => {
    // Execute your Bash script here
    exec('./swap_prompt.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send('Error executing script');
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.send('Script executed successfully');
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
