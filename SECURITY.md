# Security Policy

We take the security of EcoSphere seriously. This document outlines the supported versions, reporting procedures, response commitments, and out-of-scope vulnerability criteria.

## Supported Versions

Only the latest active release versions of EcoSphere receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in EcoSphere, please do not open a public issue. Instead, report it privately:

- **Email**: security@ecosphere-carbon-footprint.web.app (or placeholder: dev@ecosphere.com)
- **Encryption GPG Key**: [Link/Key ID if applicable]

Please include a detailed description of the vulnerability, step-by-step instructions or proof-of-concept scripts to reproduce the issue, and potential security impact.

### Our Commitment

If you report a vulnerability under responsible disclosure practices, we commit to the following response timeline:

1. **Acknowledgement**: Within 48 hours of receiving the vulnerability report.
2. **Initial Assessment**: Within 5 business days, confirming validation or asking for clarification.
3. **Resolution & Patching**: We aim to release a patch or fix within 30 days of validation, keeping the reporter informed of progress.
4. **Credit**: We will credit you in our release notes unless you request anonymity.

## Out of Scope Items

The following items are considered out of scope for our security policy and do not qualify for security responses:

- Simulated credentials stored in client-side code (`eco@ecosphere.com` / `greenfuture`) designed strictly for demonstration/workspaces testing purposes.
- Client-side local storage manipulation (as the application state is maintained locally in user browser space).
- Denial of Service (DoS) attacks on our static hosting providers (such as Google Firebase Hosting).
- Missing HTTP headers on third-party CDNs.
