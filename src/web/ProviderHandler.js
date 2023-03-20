// ProviderHandler

const { Page, HTTPRequest, HTTPResponse } = require('puppeteer');
const { WebHandler } = require('./WebHandler');

/**
 * Base ProviderHandler class.
 */
class ProviderHandler extends WebHandler {
    /**
     * @returns {string} provider name
     */
    getProviderName() {
        throw new Error('Not implemented yet');
    }

    /**
     * @param {Page} page
     * @param {HTTPRequest} request
     * @returns {boolean} true if the provider recognizes the request
     */
    async checkRequest(page, request) {}

    /**
     * @param {Page} page
     * @param {HTTPResponse} response
     * @returns {boolean} true if the provider recognizes the response
     */
    async checkResponse(page, response) {}
}

module.exports = { ProviderHandler };
