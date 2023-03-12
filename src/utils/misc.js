// Misc utils

async function sleep(msec) {
    return new Promise((resolve) => setTimeout(resolve, msec));
}

async function findAsync(items, predicate) {
    for (const item of items) {
        if (await predicate(item)) return item;
    }
}

module.exports = { sleep, findAsync };
