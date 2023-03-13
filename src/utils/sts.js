// STS utils

const { STS } = require('@aws-sdk/client-sts');
const sts = new STS();

const DURATION = 3600;

async function getSTSToken(principal, role, assertion, duration = null) {
    return new Promise((resolve, reject) => {
        const params = {
            DurationSeconds: +duration || DURATION,
            PrincipalArn: principal,
            RoleArn: role,
            SAMLAssertion: assertion,
        };
        sts.assumeRoleWithSAML(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = { DURATION, getSTSToken };
