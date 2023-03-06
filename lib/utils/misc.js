// Misc utils

async function sleep(msec) {
    return new Promise((resolve) => setTimeout(resolve, msec));
}

module.exports = { sleep };
