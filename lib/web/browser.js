// Browser

const puppeteer = require('puppeteer');
const { WebHandler } = require('./WebHandler');

const isTopLevelNavigation = (request) => {
    const frame = request.frame();
    const parentFrame = frame && frame.parentFrame();
    return request.isNavigationRequest() && !parentFrame;
};

/**
 * @param {string} url
 * @param {WebHandler} handler
 * @returns {Promise<any>}
 */
async function browserLogin(url, handler) {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            waitForInitialPage: true,
        });

        const page = (await browser.pages())[0] || (await browser.newPage());
        await page.setRequestInterception(true);

        const close = () => browser.close().catch(console.error);

        const doResolve = (data) => close().then(() => resolve(data));
        const doReject = (error) => close().then(() => reject(error));

        const safeHandler =
            (handler) =>
            (...args) =>
                handler(...args).catch(doReject);

        const onRequest = async (request) => {
            if (isTopLevelNavigation(request)) {
                const result = await handler.onRequest(page, request);
                if (result) {
                    return doResolve(result);
                }
            }
            request.continue();
        };

        const onResponse = async (response) => {
            const request = response.request();
            if (isTopLevelNavigation(request)) {
                const result = await handler.onResponse(page, response);
                if (result) {
                    return doResolve(result);
                }
            }
        };

        const onPageLoaded = async () => {
            const result = await handler.onPageLoaded(page);
            if (result) {
                return doResolve(result);
            }
        };

        page.on('request', safeHandler(onRequest));
        page.on('response', safeHandler(onResponse));
        page.on('domcontentloaded', safeHandler(onPageLoaded));

        await handler.onPageInit(page).catch(doReject);

        page.goto(url);
    });
}

module.exports = { browserLogin, isTopLevelNavigation };
