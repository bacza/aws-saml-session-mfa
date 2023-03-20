# aws-saml-session-mfa

A command line utility to create AWS credentials using SAML-based identity provider.

It is used to obtain AWS short-term credentials for command line use when you are only given the AWS Console access via federated single sign-on (SSO) authentication.

This is an evolution of [aws-saml-session](https://www.npmjs.com/package/aws-saml-session) package which adds support for multi-factor authentication (MFA) and different kind of identity providers.

## Features

- Creates or updates the standard AWS credentials file with the newly obtained AWS short-term credentials,
- Supports different kinds of SAML-based identity providers like AzureAD or ADFS,
- Supports multi-factor authentication (MFA),
- Supports interactive (manual) and automated modes of operation,
- Designed in extensibility in mind, so the support for more identity providers in automated mode can easily be added in the future (contribution is welcome!).

## Identity providers supported

Virtually any identity provider supported by [AWS SAML-based SSO federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_enable-console-saml.html) should work in interactive mode.

For automated mode, the following identity providers are currently supported:

- Azure Active Directory (AAD),
- Active Directory Federation Services (ADFS).

## Installation

The easiest way is to install the script globally:

```
npm install -g aws-saml-session-mfa
```

## Configuration

Configuration can be provided in three different ways:

- by using command line arguments,
- by setting up environment variables,
- by using `.env` file with the environment variables.

Command line arguments have the highest precedence, and the `.env` file has the lowest.

The following table describes all the available options:

| Command line argument      | Environment variable | Description                                                                      |
| -------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `--help`                   | -                    | Prints the help message.                                                         |
| `--gui`                    | -                    | Enables GUI mode. Web browser is visible in this mode. (this is the default)     |
| `--no-gui`                 | -                    | Disables GUI mode. Web browser is hidden in this mode.                           |
| `--url <url>`              | `IDP_URL`            | (REQUIRED) Identity provider login URL.                                          |
| `--user <user>`            | `IDP_USER`           | Identity provider username.                                                      |
| `--pass <pass>`            | `IDP_PASS`           | Identity provider password.                                                      |
| `--secret <secret>`        | `IDP_TOTP`           | Identity provider Time-based One Time Password (TOTP) secret.                    |
| `--profile <name>`         | `AWS_PROFILE`        | (REQUIRED) AWS credentials profile name to use.                                  |
| `--role <name>`            | `AWS_ROLE`           | AWS role name to choose at the final login step. (if multiple are available)     |
| `--duration <value><unit>` | `AWS_DURATION`       | Validity duration for the generated credentials. Units: s, m, h. (default is 1h) |

## Usage

Get the usage help message:

```sh
aws-saml-session-mfa --help
```

Provide the required configuration options as environment variables and run without arguments:

```sh
# For Windows:

set IDP_URL=<login_url>
set AWS_PROFILE=<profile>

aws-saml-session-mfa
```

```sh
# For Linux/MacOS:

export IDP_URL=<login_url>
export AWS_PROFILE=<profile>

aws-saml-session-mfa
```

Provide the required configuration options as arguments:

```sh
aws-saml-session-mfa --url <login_url> --profile <profile>
```

Change the default credentials validity duration:

```sh
aws-saml-session-mfa --url <login_url> --profile <profile> --duration 30m
```

Enable the `automated` mode by providing the required authentication information:

```sh
aws-saml-session-mfa --url <login_url> --profile <profile> --user <user> --pass <pass>
```

In case the MFA is required, supply the TOTP secret as well, so the TOTP code can be generated on-the-fly:

```sh
aws-saml-session-mfa --url <login_url> --profile <profile> --user <user> --pass <pass> --secret <totp_secret>
```

Note: The only supported option for MFA in `automated` mode is Time-based One Time Passwords (TOTPs) as the TOTP codes can be generated automatically based on the secret provided.

Note: For `interactive` mode, any MFA is supported as it is handled manually by the user anyway.

## Demo

Example script output for fully automated headless mode run:

```
aws-saml-session-mfa --no-gui

MAIN: Starting AWS-SAML-SESSION-MFA v1.1.0...
MAIN: Starting web browser... (headless mode)
IDP: Identity Provider detected: Azure Active Directory (AAD)
WEB: Page loaded: 'Redirecting'
WEB: Page loaded: 'Sign in to your account'
IDP: Autofill: entering username...
IDP: Autofill: entering password...
WEB: Page loaded: 'Sign in to your account'
IDP: Autofill: entering TOTP code...
MAIN: SAML response received.
MAIN: Assuming IAM role: arn:aws:iam::***:role/***-Developer
MAIN: Saving AWS credentials profile: dev
MAIN: Done.
```

Note: All the configuration options were provided using `.env` file.

## How it works

The utility is using a web browser automation library [Puppeteer](https://pptr.dev/) to handle the authentication process with identity provider (including any MFA if required).
Then it intercepts the SAML response from identity provider and creates AWS short-term credentials by calling AWS STS service to assume selected IAM role.
Finally it updates the standard AWS credentials file with the newly obtained credentials, so it can be used by any CLI tool or AWS SDK.

Regarding the user authentication process - there are two modes of operation: `interactive` and `automated`.

For `interactive` mode there is nothing special implemented, the user is required to enter all the credentials manually in order to authenticate.

For `automated` mode there is an `autofill` functionality which tries to fill in the required credentials for the user automatically. There are specific autofill _handlers_ per identity provider as the login page differs for each. The handler is required to recognize the login page of the provider it supports, and then to interact with it to complete the authentication process. It's just automated _typing_ into fields and _clicking_ on the buttons. ;)

If the autofill handler is able to enter all the required information, the utility can be run in fully automated headless mode - without even displaying the web browser GUI (which is enabled by `--no-gui` CLI option). Otherwise the user will still need to enter the missing information, thus making it a `semi-automated` mode (in this case `--no-gui` option should be skipped).

## Bugs and contribution

Any contribution to the project is welcome! If you found a bug, or want to see your identity provider fully supported in `automated` mode, just drop me a line by email or even better, file an issue on [GitHub](https://github.com/bacza/aws-saml-session-mfa/issues).
