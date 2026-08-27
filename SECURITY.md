# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Best Practices

1. **Environment Secrets**:
   - Never commit `.env` or plain-text credentials to the git repository.
   - Use high-entropy 256-bit hex keys for `JWT_SECRET`.
   - Rotate database passwords and Gmail App Passwords periodically.

2. **Session Security**:
   - Authentication tokens are stored in `HttpOnly`, `SameSite=Lax` cookies with production `Secure` flags.
   - Server-side middleware validates all requests at the edge before rendering protected components.

3. **Reporting a Vulnerability**:
   - If you discover a security issue, please email `32301001140@std.bau.edu.jo` directly with reproduction details.
   - Please do not disclose vulnerabilities publicly before a patch has been released.
