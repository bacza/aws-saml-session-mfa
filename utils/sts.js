// STS utils

const { STS } = require('@aws-sdk/client-sts');
const sts = new STS();

async function getSTSToken(principal, role, assertion) {
    return new Promise((resolve, reject) => {
        const params = {
            DurationSeconds: 3600,
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

module.exports = { getSTSToken };
