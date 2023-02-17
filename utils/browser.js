// Browser utils

const puppeteer = require('puppeteer');

async function browserLogin(url, onRequest) {
    const isTopLevelNavigation = (request) => {
        const frame = request.frame();
        const parentFrame = frame && frame.parentFrame();
        return request.isNavigationRequest() && !parentFrame;
    };

    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            waitForInitialPage: true,
        });

        const page = (await browser.pages())[0] || (await browser.newPage());
        await page.setRequestInterception(true);

        page.on('request', async (request) => {
            try {
                if (isTopLevelNavigation(request)) {
                    const result = await onRequest(request);
                    if (result) {
                        await browser.close().catch(console.error);
                        return resolve(result);
                    }
                }
                request.continue();
            } catch (error) {
                await browser.close().catch(console.error);
                return reject(error);
            }
        });

        page.goto(url);
    });
}

module.exports = { browserLogin };
