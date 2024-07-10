const fs = require('fs');

function getCookies() {
    return JSON.parse(fs.readFileSync('resources/cookies.json', 'utf8'));
}

module.exports = getCookies;