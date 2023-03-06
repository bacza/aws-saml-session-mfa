const { Page, HTTPRequest, HTTPResponse } = require('puppeteer');

/**
 * Base WebHandler class.
 */
class WebHandler {
    /**
     * @param {Page} page
     * @param {HTTPRequest} request
     */
    async onRequest(page, request) {}

    /**
     * @param {Page} page
     * @param {HTTPResponse} response
     */
    async onResponse(page, response) {}

    /**
     * @param {Page} page
     */
    async onPageCreated(page) {}

    /**
     * @param {Page} page
     */
    async onPageLoaded(page) {}
}

module.exports = { WebHandler };
