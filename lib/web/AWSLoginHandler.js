// AWSLoginHandler

const { HTTPRequest, Page } = require('puppeteer');
const querystring = require('querystring');
const { getSAMLRoles } = require('../utils/saml');
const { WebHandler } = require('./WebHandler');
const { base64decode, simplifyURL } = require('./webutils');
const { sleep } = require('../utils/misc');
const { generateCode } = require('../utils/totp');

const { IDP_USER, IDP_PASS, IDP_TOTP_SECRET, AWS_ROLE } = process.env;

const REG_AWS_SIGNIN_URL =
    /^https:\/\/([^\.]+\.)?signin\.aws\.amazon\.com\/saml/;

/**
 * AWS login handler.
 */
class AWSLoginHandler extends WebHandler {
    /**
     * @param {HTTPRequest} request
     * @returns {boolean}
     * @private
     */
    isAWSLoginRequest(request) {
        const method = request.method();
        const url = request.url();
        return method === 'POST' && REG_AWS_SIGNIN_URL.test(simplifyURL(url));
    }

    /**
     * @param {string} samlResponse
     * @param {string} selectedRole
     * @returns {any}
     * @private
     */
    processSAMLResponse(samlResponse, selectedRole) {
        const roles = getSAMLRoles(base64decode(samlResponse));
        const role =
            roles.length === 1
                ? roles[0]
                : roles.find((item) => item.role === selectedRole);
        if (role) {
            return { success: true, samlResponse, roles, role };
        }
    }

    /**
     * @param {Page} page
     * @param {HTTPRequest} request
     */
    async onRequest(page, request) {
        // console.log(
        //     'HTTP: >> %s %s',
        //     request.method(),
        //     simplifyURL(request.url())
        // );
        if (this.isAWSLoginRequest(request)) {
            const payload = request.postData();
            const parsed = querystring.parse(payload);
            const { SAMLResponse, roleIndex } = parsed;
            const selectedRole = roleIndex || AWS_ROLE;
            return this.processSAMLResponse(SAMLResponse, selectedRole);
        }
    }

    /**
     * @param {Page} page
     * @private
     */
    async installUserFiller(page) {
        if (IDP_USER == null) return;
        const XPATH_INPUT = '//*[@id="i0116"]';
        const XPATH_BUTTON = '//*[@id="idSIButton9"]';
        return Promise.resolve()
            .then(() => sleep(2000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) => {
                console.log('AUTOFILL: Entering username...');
                return result.type(IDP_USER);
            })
            .then(() => sleep(500))
            .then(() => page.waitForXPath(XPATH_BUTTON))
            .then((result) => result.click())
            .then(() => this.installPassFiller(page));
    }

    /**
     * @param {Page} page
     * @private
     */
    async installPassFiller(page) {
        if (IDP_PASS == null) return;
        const XPATH_INPUT = '//*[@id="i0118"]';
        const XPATH_BUTTON = '//*[@id="idSIButton9"]';
        return Promise.resolve()
            .then(() => sleep(2000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) => {
                console.log('AUTOFILL: Entering password...');
                return result.type(IDP_PASS);
            })
            .then(() => sleep(500))
            .then(() => page.waitForXPath(XPATH_BUTTON))
            .then((result) => result.click())
            .then(() => this.installCodeFiller(page));
    }

    /**
     * @param {Page} page
     * @private
     */
    async installCodeFiller(page) {
        if (IDP_TOTP_SECRET == null) return;
        const XPATH_INPUT = '//*[@id="idTxtBx_SAOTCC_OTC"]';
        const XPATH_BUTTON = '//*[@id="idSubmit_SAOTCC_Continue"]';
        return Promise.resolve()
            .then(() => sleep(2000))
            .then(() => page.waitForXPath(XPATH_INPUT))
            .then((result) =>
                generateCode(IDP_TOTP_SECRET).then((code) => {
                    console.log('AUTOFILL: Entering OTP code...');
                    return result.type(code);
                })
            )
            .then(() => sleep(100))
            .then(() => page.waitForXPath(XPATH_BUTTON))
            .then((result) => result.click());
    }

    /**
     * @param {Page} page
     */
    async onPageCreated(page) {
        this.installUserFiller(page).catch(console.log);
    }

    /**
     * @param {Page} page
     */
    async onPageLoaded(page) {
        console.log('PAGE LOADED:', await page.title());
    }
}

module.exports = { AWSLoginHandler };
