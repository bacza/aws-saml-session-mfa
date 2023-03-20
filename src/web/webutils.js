// Web utils

function base64decode(data) {
    return Buffer.from(data, 'base64').toString('utf8');
}

function simplifyURL(str) {
    const url = new URL(str);
    return `${url.origin}${url.pathname}`;
}

module.exports = { base64decode, simplifyURL };
