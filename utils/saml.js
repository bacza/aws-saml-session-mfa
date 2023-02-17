// SAML utils

const JSSoup = require('jssoup').default;

function getSAMLRoles(samlResponse) {
    const soup = new JSSoup(samlResponse);
    const roles = soup
        .findAll('AttributeValue')
        .filter(
            (value) =>
                value.parent &&
                value.parent.name === 'Attribute' &&
                value.parent.attrs &&
                value.parent.attrs.Name ===
                    'https://aws.amazon.com/SAML/Attributes/Role'
        )
        .map((value) => {
            const [provider, role] = (value.text || '').split(',');
            return { provider, role };
        });
    return roles;
}

module.exports = { getSAMLRoles };
