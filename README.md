# aws-saml-session-mfa

Create temporary AWS credentials using SAML-based identity provider.

This is an evolution of [aws-saml-session](https://www.npmjs.com/package/aws-saml-session) package which adds support for multi-factor authentication (MFA) flows.

It is using a web browser automation library [Puppeteer](https://pptr.dev/) to go through the standard login process (including any MFA if required), then intercepts the SAML response from Identity Provider and creates the temporary AWS credentials to be used by any CLI tools.

## Installation

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
