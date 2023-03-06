// Config file utils

const os = require('os');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

const HOME = os.homedir();
const CONFIG_FILE = path.join(HOME, '.aws', 'credentials');

function readFile(filename) {
    try {
        return ini.decode(fs.readFileSync(filename, 'utf-8'));
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        throw error;
    }
}

function writeFile(filename, config) {
    fs.writeFileSync(filename, ini.encode(config, { whitespace: true }));
}

function saveCredentials(filename, profile, sts) {
    const { Credentials } = sts || {};
    const section = {
        aws_access_key_id: Credentials.AccessKeyId,
        aws_secret_access_key: Credentials.SecretAccessKey,
        aws_session_token: Credentials.SessionToken,
    };
    const config = readFile(filename);
    config[profile] = section;
    writeFile(filename, config);
}

module.exports = { CONFIG_FILE, saveCredentials };
