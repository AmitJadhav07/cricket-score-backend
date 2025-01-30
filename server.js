const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable CORS to allow frontend to fetch data
const cors = require('cors');
app.use(cors());

// Save commentary to a local file
const saveCommentary = (commentary) => {
    fs.writeFileSync('commentary.json', JSON.stringify(commentary, null, 2));
};

// Fetch live cricket score and commentary
app.get('/cricket-score', async (req, res) => {
    try {
        const { data } = await axios.get('https://www.espncricinfo.com/live-cricket-score'); // Example URL
        const $ = cheerio.load(data);

        const score = $('div.live-score').text().trim(); // Change this selector as needed
        const commentary = [];
        
        // Example of fetching ball-by-ball commentary
        $('div.commentary-item').each((index, element) => {
            commentary.push($(element).text().trim());
        });

        // Save commentary locally
        saveCommentary(commentary);

        res.json({ score, commentary });
    } catch (error) {
        console.error('Error fetching cricket data:', error.message);
        res.status(500).json({ error: 'Failed to fetch cricket data' });
    }
});

// Serve saved commentary
app.get('/saved-commentary', (req, res) => {
    try {
        const commentary = JSON.parse(fs.readFileSync('commentary.json'));
        res.json({ commentary });
    } catch {
        res.json({ commentary: [] });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
