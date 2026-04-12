const fs = require('fs');
const path = require('path');

exports.getLogs = (req, res) => {
    const logPath = path.join(__dirname, '../logs/combined.log');
    const raw = fs.readFileSync(logPath, 'utf-8');

    const logs = raw.trim().split('\n').map(line => {
        try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);

    const stats = {
        total: logs.length,
        info:  logs.filter(l => l.level === 'info').length,
        warn:  logs.filter(l => l.level === 'warn').length,
        error: logs.filter(l => l.level === 'error').length,
    };

    res.render('logs', { title: 'Logs', logs, stats });
};
