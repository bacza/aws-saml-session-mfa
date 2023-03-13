// AADHandler

const { HTTPRequest, Page } = require('puppeteer');
const { ProviderHandler } = require('./ProviderHandler');
const { sleep } = require('../utils/misc');
const { generateCode } = require('../utils/totp');

/**
 * Azure Active Directory (AAD) provider handler.
 */
class AADHandler extends ProviderHandler {
    constructor({ user, pass, totp } = {}) {
        super();
        this.user = user;
        this.pass = pass;
        this.totp = totp;
    }

    /**
     * @returns {string} provider name
     */
    getProviderName() {
        return 'Azure Active Directory (AAD)';
    }

    /**
     * @param {Page} page
     * @param {HTTPRequest} request
     * @returns {boolean} true if the provider recognizes the request
     */
    async checkRequest(page, request) {
        const url = new URL(request.url());
        if (url.origin !== 'https://login.microsoftonline.com') return;
        const redir = url.searchParams.get('redirect_uri');
        if (!redir) return;
        const url2 = new URL(redir);
        return (
            url2.origin === 'https://account.activedirectory.windowsazure.com'
        );
    }

    /**
     * @param {Page} page
     */
    async onPageInit(page) {
        Promise.resolve(true)
            .then((cont) => cont && this.installUserFiller(page))
            .then((cont) => cont && this.installPassFiller(page))
            .then((cont) => cont && this.installCodeFiller(page))
            .catch(console.log);
    }

    /**
     * @param {Page} page
     * @private
     */
    async installUserFiller(page) {
        if (this.user == null) return false;
        const XPATH_INPUT = '//*[@id="i0116"]';
        const XPATH_BUTTON = '//*[@id="idSIButton9"]';
        return Promise.resolve()
            .then(() => sleep(2000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) => {
                console.log('IDP: Autofill: entering username...');
                return result.type(this.user);
            })
            .then(() => sleep(500))
            .then(() => page.waitForXPath(XPATH_BUTTON))
            .then((result) => result.click())
            .then(() => true);
    }

    /**
     * @param {Page} page
     * @private
     */
    async installPassFiller(page) {
        if (this.pass == null) return false;
        const XPATH_INPUT = '//*[@id="i0118"]';
        const XPATH_BUTTON = '//*[@id="idSIButton9"]';
        return Promise.resolve()
            .then(() => sleep(2000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) => {
                console.log('IDP: Autofill: entering password...');
                return result.type(this.pass);
            })
            .then(() => sleep(500))
            .then(() => page.waitForXPath(XPATH_BUTTON))
            .then((result) => result.click())
            .then(() => true);
    }

    /**
     * @param {Page} page
     * @private
     */
    async installCodeFiller(page) {
        if (this.totp == null) return false;
        const XPATH_INPUT = '//*[@id="idTxtBx_SAOTCC_OTC"]';
        const XPATH_BUTTON = '//*[@id="idSubmit_SAOTCC_Continue"]';
        return Promise.resolve()
            .then(() => sleep(2000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) =>
                generateCode(this.totp).then((code) => {
                    console.log('IDP: Autofill: entering OTP code...');
                    return result.type(code);
                })
            )
            .then(() => sleep(100))
            .then(() => page.waitForXPath(XPATH_BUTTON))
            .then((result) => result.click())
            .then(() => true);
    }
}

module.exports = { AADHandler };
