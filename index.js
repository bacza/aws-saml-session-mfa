#!/usr/bin/env node

/**
 * Create temporary AWS credentials using SAML-based identity provider.
 */

require('dotenv').config();
const { META, getOpts, validateOpts, help } = require('./src/utils/cli');
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
        console.log(
            'MAIN: Starting %s v%s...',
            String(META.name).toUpperCase(),
            META.version
        );

        const opts = getOpts();
        if (opts.help) {
            help();
            return;
        }
        validateOpts(opts);

        console.log(
            'MAIN: Starting web browser...',
            opts.gui ? '' : '(headless mode)'
        );

        const awsHandler = new AWSHandler(opts);
        const idpHandlers = [new AADHandler(opts), new ADFSHandler(opts)];
        const mainHandler = new MainHandler(awsHandler, idpHandlers);

        const result = await browserLogin(opts.url, mainHandler, opts.gui);
        const { success, samlResponse, role } = result;

        if (!success) throw new Error('SAML_PROCESSING_ERROR');

        console.log('MAIN: SAML response received.');

        console.log('MAIN: Assuming IAM role:', role.role);
        const sts = await getSTSToken(
            role.provider,
            role.role,
            samlResponse,
            opts.duration
        );

        console.log('MAIN: Saving AWS credentials profile:', opts.profile);
        saveCredentials(CONFIG_FILE, opts.profile, sts);

        console.log('MAIN: Done.');
    } catch (error) {
        console.log('\nERROR:', error.message);
        if (error instanceof UsageError)
            console.log('\nMAIN: Try --help for help.');
        process.exit(1);
    }
}

if (require.main === module) main();
