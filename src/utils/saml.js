// SAML utils

const JSSoup = require('jssoup').default;

const REGEXP_ROLE =
    /((.+:role\/.+),(.+:saml-provider\/.+))|((.+:saml-provider\/.+),(.+:role\/.+))/i;

function getSAMLRoles(samlResponse) {
    const soup = new JSSoup(samlResponse);
    const roles = soup
        .findAll('AttributeValue')
        .filter(
            (value) =>
                value.text &&
                value.parent &&
                value.parent.name === 'Attribute' &&
                value.parent.attrs &&
                value.parent.attrs.Name ===
                    'https://aws.amazon.com/SAML/Attributes/Role'
        )
        .map((value) => {
            const [_, m1, r1, p1, m2, p2, r2] =
                REGEXP_ROLE.exec(value.text) || [];
            if (m1) return { provider: p1, role: r1 };
            if (m2) return { provider: p2, role: r2 };
            console.log('SAML: Invalid role attribute:', value.text);
            return null;
        })
        .filter((value) => !!value);
    return roles;
}

module.exports = { getSAMLRoles };
