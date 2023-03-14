# aws-saml-session-mfa

A command line utility to create AWS temporary credentials using SAML-based identity provider.

It is used to obtain AWS credentials for command line use when you are only given the AWS Console access via federated single sign-on (SSO).

This is an evolution of [aws-saml-session](https://www.npmjs.com/package/aws-saml-session) package which adds support for multi-factor authentication (MFA) flows or support for different kind of identity providers.

## Features

- Creates or updates the standard AWS credentials file with the newly obtained AWS short-term credentials,
- Supports different kinds of SAML-based identity providers like AzureAD or ADFS,
- Supports multi-factor authentication flows,
- Supports interactive (manual) and automated modes of operation,
- Designed in extensibility in mind, so the support for more identity providers in automated mode can be easily added in the future.

## Identity providers supported

Virtually any identity provider supported by [AWS SAML-based SSO federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_enable-console-saml.html) should work in `interactive` mode.

For `automated` mode, the following identity providers are currently supported:

- Azure Active Directory (AzureAD),
- Active Directory Federation Services (ADFS).

## Installation

The easiest way is to install the tool globally:

```
npm install -g aws-saml-session-mfa
```

## Configuration

Set the following environment variables:

- IDP_URL - Identity Provider login URL,
- AWS_PROFILE - `aws-cli` profile name.

## Usage

```
aws-saml-session-mfa
```

## How it works internally

The tool is using a web browser automation library [Puppeteer](https://pptr.dev/) to handle the authentication flow with identity provider (including any MFA if required).
Then it intercepts the SAML response from identity provider and creates the temporary AWS credentials to be used by any CLI tool or AWS SDK.

## Bugs and contribution

Any contribution to the project is welcome! If you found a bug, or want to see your identity provider fully supported in `automated` mode, just drop me a line by email or even better, file an issue on [GitHub](https://github.com/bacza/aws-saml-session-mfa/issues).
