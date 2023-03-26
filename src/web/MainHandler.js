// MainHandler

const { Page, HTTPRequest, HTTPResponse } = require('puppeteer');
const { WebHandler } = require('./WebHandler');
const { ProviderHandler } = require('./ProviderHandler');
const { findAsync } = require('../utils/misc');

class MainHandler extends WebHandler {
    /**
     * @param {WebHandler} awsHandler
     * @param {Array<ProviderHandler>} idpHandlers
     */
    constructor(awsHandler, idpHandlers) {
        super();
        this.awsHandler = awsHandler;
        this.idpHandlers = idpHandlers;
        this.idpHandler = null;
        this.idpInitialized = false;
    }

    /**
     * @private
     */
    async findHandler(predicate) {
        const handler = await findAsync(this.idpHandlers, predicate);
        if (handler) {
            console.log(
                'IDP: Identity Provider detected:',
                handler.getProviderName()
            );
            this.idpHandler = handler;
        }
    }

    /**
     * @param {Page} page
     * @param {HTTPRequest} request
     */
    async onRequest(page, request) {
        // Propagate to AWS handler
        const result = await this.awsHandler.onRequest(page, request);
        if (result) return result;

        // Lazy init IDP handler
        if (!this.idpHandler) {
            await this.findHandler((h) => h.checkRequest(page, request));
        }

        // Propagate to IDP handler (if any)
        if (this.idpHandler) {
            await this.idpHandler.onRequest(page, request);
        }
    }

    /**
     * @param {Page} page
     * @param {HTTPResponse} response
     */
    async onResponse(page, response) {
        // Propagate to AWS handler
        const result = await this.awsHandler.onResponse(page, response);
        if (result) return result;

        // Lazy init IDP handler
        if (!this.idpHandler) {
            await this.findHandler((h) => h.checkResponse(page, response));
        }

        // Propagate to IDP handler (if any)
        if (this.idpHandler) {
            await this.idpHandler.onResponse(page, response);
        }
    }

    /**
     * @param {Page} page
     */
    async onPageInit(page) {
        // Propagate to AWS handler
        return this.awsHandler.onPageInit(page);
    }

    /**
     * @param {Page} page
     */
    async onPageLoaded(page) {
        console.log(
            "WEB: Page loaded: '%s'",
            await page.title().catch(() => '')
        );

        // Propagate to AWS handler
        await this.awsHandler.onPageLoaded(page);

        // Propagate to IDP handler (if any)
        if (this.idpHandler) {
            if (!this.idpInitialized) {
                this.idpInitialized = true;
                await this.idpHandler.onPageInit(page);
            }
            await this.idpHandler.onPageLoaded(page);
        }
    }
}

module.exports = { MainHandler };
