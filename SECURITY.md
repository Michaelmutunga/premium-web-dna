# Security Policy

## Supported versions

Only the latest released version of the framework receives security fixes.

## Reporting a vulnerability

Do not open a public issue for a vulnerability. Report it privately to the
maintainers with:

- the affected file or command;
- a minimal reproduction;
- the impact;
- any suggested fix.

Do not include client data, credentials, or private assets in the report.

## Scope

Security-sensitive areas include:

- `scripts/capture-site.mjs`, which loads third-party pages;
- `scripts/scaffold-dna-skill.mjs`, which writes generated files;
- `scripts/merge-dna.mjs`, which processes untrusted JSON;
- any command that writes outside the intended output directory.

## Audit authorisation

Only audit sites and repositories you are authorised to inspect. Runtime capture
must be treated as untrusted: use an isolated browser profile, avoid authenticated
sessions unless explicitly authorised, and never publish captured personal data or
client assets.

## Handling secrets

Never commit credentials, cookies, API keys, or client secrets. Generated
captures must redact sensitive headers and must not include authenticated session
data.
