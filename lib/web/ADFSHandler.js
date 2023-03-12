// ADFSHandler

const { HTTPRequest, Page } = require('puppeteer');
const { ProviderHandler } = require('./ProviderHandler');
const { sleep } = require('../utils/misc');

const { IDP_USER, IDP_PASS } = process.env;

/**
 * Active Directory Federation Services (ADFS) provider handler.
 */
class ADFSHandler extends ProviderHandler {
    /**
     * @returns {string} provider name
     */
    getProviderName() {
        return 'Active Directory Federation Services (ADFS)';
    }

    /**
     * @param {Page} page
     * @param {HTTPRequest} request
     * @returns {boolean} true if the provider recognizes the request
     */
    async checkRequest(page, request) {
        const url = new URL(request.url());
        if (url.pathname !== '/adfs/ls/idpinitiatedsignon.aspx') return;
        const param = url.searchParams.get('loginToRp');
        return param === 'urn:amazon:webservices';
    }

    /**
     * @param {Page} page
     */
    async onPageInit(page) {
        Promise.resolve(true)
            .then((cont) => cont && this.installUserFiller(page))
            .then((cont) => cont && this.installPassFiller(page))
            .catch(console.log);
    }

    /**
     * @param {Page} page
     * @private
     */
    async installUserFiller(page) {
        if (IDP_USER == null) return false;
        const XPATH_INPUT = '//*[@id="userNameInput"]';
        return Promise.resolve()
            .then(() => sleep(2000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) => {
                console.log('IDP: Autofill: entering username...');
                return result.type(IDP_USER);
            })
            .then(() => true);
    }

    /**
     * @param {Page} page
     * @private
     */
    async installPassFiller(page) {
        if (IDP_PASS == null) return false;
        const XPATH_INPUT = '//*[@id="passwordInput"]';
        const XPATH_BUTTON = '//*[@id="submitButton"]';
        return Promise.resolve()
            .then(() => sleep(1000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) => {
                console.log('IDP: Autofill: entering password...');
                return result.type(IDP_PASS);
            })
            .then(() => sleep(500))
            .then(() => page.waitForXPath(XPATH_BUTTON))
            .then((result) => result.click())
            .then(() => true);
    }
}

module.exports = { ADFSHandler };
