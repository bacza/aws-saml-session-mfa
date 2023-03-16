// CLI helpers

const fs = require('fs');
const path = require('path');
const parseArgs = require('minimist');
const { UsageError } = require('./errors');

const META_DEFAULT = { name: 'aws-saml-session-mfa', version: '0.0.0' };

const META = getMeta();

/**
 * Reads in the `package.json` file and returns selected metadata.
 *
 * @returns {object} metadata
 * @private
 */
function getMeta() {
    try {
        const filename = path.resolve(__dirname, '../../package.json');
        const data = fs.readFileSync(filename);
        const meta = JSON.parse(data);
        return {
            name: meta.name || META_DEFAULT.name,
            version: meta.version || META_DEFAULT.version,
        };
    } catch (_) {
        return META_DEFAULT;
    }
}

/**
 * Parses the command line options.
 *
 * @returns {object} options.
 * @throws {UsageError} in case of unknown option.
 */
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

/**
 * Validates the command line options.
 *
 * @param {object} opts
 * @throws {UsageError} if any of the validations fail.
 */
function validateOpts(opts) {
    if (!opts.profile) throw new UsageError('AWS profile name not provided.');
    if (!opts.url) throw new UsageError('IDP login URL not provided.');
    if (opts.duration != null) {
        opts.duration = duration2sec(opts.duration);
        if (!Number.isInteger(opts.duration))
            throw new UsageError('Invalid duration.');
        if (opts.duration < 900)
            throw new UsageError(
                "Invalid duration: can't be less than 15 minutes."
            );
    }
}

/**
 * Normalizes duration string into number of seconds.
 *
 * @param {string} duration duration string.
 * @returns {number} duration in seconds or null in case of invalid format.
 */
function duration2sec(duration) {
    const regex = /^(\d+)(s|m|h)?$/;
    const unit2sec = { s: 1, m: 60, h: 3600 };
    const [_, value, unit = 's'] = regex.exec(duration) || [];
    return +value * unit2sec[unit] || null;
}

/**
 * Prints help message.
 */
function help() {
    console.log(`
USAGE: ${META.name} [OPTIONS]

Where OPTIONS are:
  --help                        Prints this help message.
  --gui                         Enables GUI mode. Web browser is visible in this mode. (this is the default)
  --no-gui                      Disables GUI mode. Web browser is hidden.
  --profile <name>              (required) AWS credentials profile name to use.
                                Can be set by AWS_PROFILE environment variable.
  --role <name>                 AWS role name to choose at the final login step. (if multiple are available)
                                Can be set by AWS_ROLE environment variable.
  --url <url>                   (required) Identity Provider (IdP) login URL.
                                Can be set by IDP_URL environment variable.
  --user <user>                 IdP username.
                                Can be set by IDP_USER environment variable.
  --pass <pass>                 IdP password.
                                Can be set by IDP_PASS environment variable.
  --secret <secret>             IdP Time-based One Time Password (TOTP) secret.
                                Can be set by IDP_TOTP environment variable.
  --duration <value><unit>      Validity duration for the generated session token. Units: s, m, h.
                                Can be set by AWS_DURATION environment variable.
`);
}

module.exports = { META, getOpts, validateOpts, help };
