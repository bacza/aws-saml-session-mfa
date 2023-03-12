// WebHandler

const { Page, HTTPRequest, HTTPResponse } = require('puppeteer');

/**
 * Base WebHandler class.
 */
class WebHandler {
    /**
     * @param {Page} page
     */
    async onPageInit(page) {}

    /**
     * @param {Page} page
     */
    async onPageLoaded(page) {}

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
}

module.exports = { WebHandler };
