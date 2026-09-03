# Security Policy

This is a portfolio/demonstration project, not a production compliance
system. See `docs/THREAT-MODEL.md` for the full design-level threat model
mapped to OWASP LLM Top 10, OWASP API/Web Top 10, MITRE ATT&CK/ATLAS, and
NIST AI RMF.

## Reporting a concern

If you find a security issue in this repository, please open a GitHub
issue describing it. This is a demo project with no production users, so
there's no formal disclosure SLA, but reports are genuinely welcome and
will be looked at.

## What this app does and does not protect

- **Does not** require or store authentication credentials -- there is no
  login system in this MVP.
- **Does not** persist submitted implementation statements server-side by
  default.
- **Does** warn users not to submit real PHI, PII, credentials, production
  secrets, or confidential audit evidence, since this is a public
  demonstration deployment.
- Review history lives only in the browser's own localStorage -- private
  to that browser/device, never transmitted to or stored by the server.

## Known limitations (see docs/THREAT-MODEL.md section 6 for full detail)

- Rate limiting is per-serverless-instance, not globally distributed.
- No authentication or per-user data isolation exists.
- The MCP endpoint is publicly reachable (read-only, rate-limited, but not
  access-controlled).

## Dependency security

- Dependabot alerts are enabled on this repository.
- Run `npm audit` locally before major releases.
