#!/usr/bin/env node

/**
 * Create temporary AWS credentials using SAML-based identity provider.
 */

const { browserLogin } = require('./lib/web/browser');
const { getSTSToken } = require('./lib/utils/sts');
const { CONFIG_FILE, saveCredentials } = require('./lib/utils/config');
const { MainHandler } = require('./lib/web/MainHandler');
const { AWSHandler } = require('./lib/web/AWSHandler');
const { AADHandler } = require('./lib/web/AADHandler');
const { ADFSHandler } = require('./lib/web/ADFSHandler');

const { AWS_PROFILE, IDP_URL } = process.env;

function checkUsage() {
    if (!AWS_PROFILE) throw new Error('AWS_PROFILE not set!');
    if (!IDP_URL) throw new Error('IDP_URL not set!');
}

async function main() {
    try {
        checkUsage();

        console.log('MAIN: Opening web browser...');
        const awsHandler = new AWSHandler();
        const idpHandlers = [new AADHandler(), new ADFSHandler()];
        const mainHandler = new MainHandler(awsHandler, idpHandlers);

        const result = await browserLogin(IDP_URL, mainHandler);
        const { success, samlResponse, role } = result;

        if (!success) throw new Error('SAML_PROCESSING_ERROR');

        console.log('MAIN: SAML response received.');

        console.log('MAIN: Assuming role:', role.role);
        const sts = await getSTSToken(role.provider, role.role, samlResponse);

        console.log('MAIN: Saving AWS credentials:', AWS_PROFILE);
        saveCredentials(CONFIG_FILE, AWS_PROFILE, sts);

        console.log('MAIN: Done.');
        process.exit(0);
    } catch (error) {
        console.log('ERROR:', error.message);
        process.exit(1);
    }
}

main();
