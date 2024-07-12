const fs = require('fs');

function getCookies() {
    const data = JSON.parse(fs.readFileSync('resources/cookies.json', 'utf8'));

    if (!data || Object.keys(data).length === 0) {
        return null;
    }

    return data;
}

module.exports = getCookies;