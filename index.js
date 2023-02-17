#!/usr/bin/env node

// Create temporary AWS credentials using SAML provider.

const querystring = require('querystring');

const { browserLogin } = require('./utils/browser');
const { getSAMLRoles } = require('./utils/saml');
const { getSTSToken } = require('./utils/sts');
const { CONFIG_FILE, saveCredentials } = require('./utils/config');

const { IDP_URL, AWS_PROFILE } = process.env;

const AWS_SIGNIN_URL = 'https://signin.aws.amazon.com/saml';

function checkUsage() {
    if (!IDP_URL) throw new Error('IDP_URL not set!');
    if (!AWS_PROFILE) throw new Error('AWS_PROFILE not set!');
}

function base64decode(data) {
    return Buffer.from(data, 'base64').toString('utf8');
}

function processSAMLResponse(samlResponse, selectedRole) {
    const roles = getSAMLRoles(base64decode(samlResponse));
    const role =
        roles.length === 1
            ? roles[0]
            : roles.find((item) => item.role === selectedRole);
    if (role) {
        return { success: true, samlResponse, roles, role };
    }
}

function handleRequest(request) {
    const isAWSSigninRequest =
        request.method() === 'POST' && request.url() === AWS_SIGNIN_URL;
    if (isAWSSigninRequest) {
        const payload = request.postData();
        const parsed = querystring.parse(payload);
        const { SAMLResponse, roleIndex } = parsed;
        return processSAMLResponse(SAMLResponse, roleIndex);
    }
}

async function main() {
    try {
        checkUsage();

        console.log('Opening browser...');
        const result = await browserLogin(IDP_URL, handleRequest);
        const { success, samlResponse, role } = result;

        if (!success) throw new Error('SAML_PROCESSING_ERROR');

        console.log('SAML response received.');

        console.log(`Assuming role: ${role.role}...`);
        const sts = await getSTSToken(role.provider, role.role, samlResponse);

        console.log(`Saving AWS credentials: ${AWS_PROFILE}...`);
        saveCredentials(CONFIG_FILE, AWS_PROFILE, sts);

        console.log('DONE.');
        process.exit(0);
    } catch (error) {
        console.log('ERROR:', error.message);
        process.exit(1);
    }
}

main();
