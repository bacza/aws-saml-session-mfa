// CLI helpers

const parseArgs = require('minimist');
const { UsageError } = require('./errors');

const SCRIPT_NAME = 'aws-saml-session-mfa';

function getOpts() {
    const env = process.env;
    const config = {
        boolean: ['help', 'gui'],
        string: ['profile', 'role', 'url', 'user', 'pass', 'totp', 'duration'],
        default: {
            help: false,
            gui: true,
            profile: env.AWS_PROFILE,
            role: env.AWS_ROLE,
            url: env.IDP_URL,
            user: env.IDP_USER,
            pass: env.IDP_PASS,
            totp: env.IDP_TOTP,
            duration: env.AWS_DURATION,
        },
        unknown: (arg) => {
            throw new UsageError(`Invalid option: ${arg}`);
        },
    };
    return parseArgs(process.argv.slice(2), config);
}

function checkOpts(opts) {
    if (!opts.profile) throw new UsageError('AWS profile not set!');
    if (!opts.url) throw new UsageError('IDP login URL not set!');
    if (opts.duration != null) {
        opts.duration = +opts.duration;
        if (!Number.isInteger(opts.duration))
            throw new UsageError('Invalid duration!');
    }
}

function help() {
    console.log(`
USAGE: ${SCRIPT_NAME} [OPTIONS]

Where OPTIONS are:
  --help                    Prints this help message.
  --gui                     Enables GUI mode. Web browser is visible in this mode. (this is the default)
  --no-gui                  Disables GUI mode. Web browser is hidden.
  --profile <name>          (required) AWS credentials profile name to use.
                            Can be set by AWS_PROFILE environment variable.
  --role <name>             AWS role name to choose at the final login step. (if multiple are available)
                            Can be set by AWS_ROLE environment variable.
  --url <url>               (required) Identity Provider (IdP) login URL.
                            Can be set by IDP_URL environment variable.
  --user <user>             IdP username.
                            Can be set by IDP_USER environment variable.
  --pass <pass>             IdP password.
                            Can be set by IDP_PASS environment variable.
  --secret <secret>         IdP Time-based One Time Password (TOTP) secret.
                            Can be set by IDP_TOTP environment variable.
  --duration <seconds>      Validity duration for the generated session token.
                            Can be set by AWS_DURATION environment variable.
`);
}

module.exports = { getOpts, checkOpts, help };
