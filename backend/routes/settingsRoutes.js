const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const settingsPath = path.join(dataDir, 'settings.json');

// Ensure data dir exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
// Ensure file exists
if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({ heroImageUrl: '', highlightedProjectId: null }));
}

router.get('/', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

router.post('/', (req, res) => {
    try {
        const { heroImageUrl, highlightedProjectId } = req.body;
        const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (heroImageUrl !== undefined) data.heroImageUrl = heroImageUrl;
        if (highlightedProjectId !== undefined) data.highlightedProjectId = highlightedProjectId;
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Failed to write settings' });
    }
});

module.exports = router;
