

import config from '../../../config.json';

function generateResponse() {
    const promptInput = document.getElementById('promptInput');
    const responseDiv = document.getElementById('response');

    const userPrompt = ""
    const apiKey = config.apiKey;

    fetch('/generate-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: `prompt=${encodeURIComponent(userPrompt)}`,
    })
    .then(response => response.text())
    .then(data => {
        responseDiv.textContent = data;
    })
    .catch(error => {
        console.error('Error fetching response:', error);
    });
}