#!/usr/bin/env node

/**
 * Create temporary AWS credentials using SAML-based identity provider.
 */

require('dotenv').config();
const { getOpts, checkOpts, help } = require('./src/utils/cli');
const { UsageError } = require('./src/utils/errors');
const { browserLogin } = require('./src/web/browser');
const { getSTSToken } = require('./src/utils/sts');
const { CONFIG_FILE, saveCredentials } = require('./src/utils/config');
const { MainHandler } = require('./src/web/MainHandler');
const { AWSHandler } = require('./src/web/AWSHandler');
const { AADHandler } = require('./src/web/AADHandler');
const { ADFSHandler } = require('./src/web/ADFSHandler');

async function main() {
    try {
        const opts = getOpts();

        if (opts.help) {
            help();
            return;
        }

        checkOpts(opts);

        console.log('MAIN: Opening web browser...');
        const awsHandler = new AWSHandler(opts);
        const idpHandlers = [new AADHandler(opts), new ADFSHandler(opts)];
        const mainHandler = new MainHandler(awsHandler, idpHandlers);

        const result = await browserLogin(opts.url, mainHandler, opts.gui);
        const { success, samlResponse, role } = result;

        if (!success) throw new Error('SAML_PROCESSING_ERROR');

        console.log('MAIN: SAML response received.');

        console.log('MAIN: Assuming role:', role.role);
        const sts = await getSTSToken(
            role.provider,
            role.role,
            samlResponse,
            opts.duration
        );

        console.log('MAIN: Saving AWS credentials:', opts.profile);
        saveCredentials(CONFIG_FILE, opts.profile, sts);

        console.log('MAIN: Done.');
    } catch (error) {
        console.log('\nERROR:', error.message);
        if (error instanceof UsageError) help();
        process.exit(1);
    }
}

if (require.main === module) main();
