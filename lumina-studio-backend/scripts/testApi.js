const fetch = require('node-fetch'); // Assuming node-fetch is not available, I'll use http or just run the server and check manually
// Wait, I don't want to install node-fetch. I'll use a simple script with 'http' module.

const http = require('http');

http.get('http://localhost:5000/api/home', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('API Response status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Hero Title:', json.hero?.title);
            console.log('Services Count:', json.services?.length);
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }
    });
}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
