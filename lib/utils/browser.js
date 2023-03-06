// Browser utils

const puppeteer = require('puppeteer');
const { WebHandler } = require('../web/WebHandler');

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

        const onRequest = async (request) => {
            try {
                if (isTopLevelNavigation(request)) {
                    const result = await handler.onRequest(page, request);
                    if (result) {
                        return doResolve(result);
                    }
                }
                request.continue();
            } catch (error) {
                return doReject(error);
            }
        };

        const onResponse = async (response) => {
            try {
                const request = response.request();
                if (isTopLevelNavigation(request)) {
                    const result = await handler.onResponse(page, response);
                    if (result) {
                        return doResolve(result);
                    }
                }
            } catch (error) {
                return doReject(error);
            }
        };

        const onPageLoaded = async () => {
            try {
                const result = await handler.onPageLoaded(page);
                if (result) {
                    return doResolve(result);
                }
            } catch (error) {
                return doReject(error);
            }
        };

        page.on('request', onRequest);
        page.on('response', onResponse);
        page.on('domcontentloaded', onPageLoaded);

        await handler.onPageCreated(page);

        page.goto(url);
    });
}

module.exports = { browserLogin, isTopLevelNavigation };
