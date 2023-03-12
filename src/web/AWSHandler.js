// AWSHandler

const { HTTPRequest, Page } = require('puppeteer');
const querystring = require('querystring');
const { getSAMLRoles } = require('../utils/saml');
const { WebHandler } = require('./WebHandler');
const { base64decode, simplifyURL } = require('./webutils');

const { AWS_ROLE } = process.env;

const REG_AWS_SIGNIN_URL =
    /^https:\/\/([^\.]+\.)?signin\.aws\.amazon\.com\/saml/;

/**
 * AWS login handler.
 */
class AWSHandler extends WebHandler {
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
        if (this.isAWSLoginRequest(request)) {
            const payload = request.postData();
            const parsed = querystring.parse(payload);
            const { SAMLResponse, roleIndex } = parsed;
            const selectedRole = roleIndex || AWS_ROLE;
            return this.processSAMLResponse(SAMLResponse, selectedRole);
        }
    }
}

module.exports = { AWSHandler };
