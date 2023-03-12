// TOTP utils

const { authenticator } = require('otplib');
const { sleep } = require('./misc');

async function generateCode(secret, minRemainingSec = 5) {
    const sec = authenticator.timeRemaining();
    if (sec < minRemainingSec) await sleep(sec * 1000);
    return authenticator.generate(secret);
}

module.exports = { generateCode };
