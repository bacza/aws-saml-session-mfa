#!/usr/bin/env node

/**
 * Create temporary AWS credentials using SAML-based identity provider.
 */

const { browserLogin } = require('./src/web/browser');
const { getSTSToken } = require('./src/utils/sts');
const { CONFIG_FILE, saveCredentials } = require('./src/utils/config');
const { MainHandler } = require('./src/web/MainHandler');
const { AWSHandler } = require('./src/web/AWSHandler');
const { AADHandler } = require('./src/web/AADHandler');
const { ADFSHandler } = require('./src/web/ADFSHandler');

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
