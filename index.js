#!/usr/bin/env node

/**
 * Create temporary AWS credentials using SAML-based identity provider.
 */

const { AWSLoginHandler } = require('./lib/web/AWSLoginHandler');
const { browserLogin } = require('./lib/utils/browser');
const { getSTSToken } = require('./lib/utils/sts');
const { CONFIG_FILE, saveCredentials } = require('./lib/utils/config');

const { AWS_PROFILE, IDP_URL } = process.env;

function checkUsage() {
    if (!AWS_PROFILE) throw new Error('AWS_PROFILE not set!');
    if (!IDP_URL) throw new Error('IDP_URL not set!');
}

async function main() {
    try {
        checkUsage();

        console.log('INFO: Opening browser...');
        const handler = new AWSLoginHandler();
        const result = await browserLogin(IDP_URL, handler);
        const { success, samlResponse, role } = result;

        if (!success) throw new Error('SAML_PROCESSING_ERROR');

        console.log('INFO: SAML response received.');

        console.log('INFO: Assuming role:', role.role);
        const sts = await getSTSToken(role.provider, role.role, samlResponse);

        console.log('INFO: Saving AWS credentials:', AWS_PROFILE);
        saveCredentials(CONFIG_FILE, AWS_PROFILE, sts);

        console.log('DONE.');
        process.exit(0);
    } catch (error) {
        console.log('ERROR:', error.message);
        process.exit(1);
    }
}

main();
