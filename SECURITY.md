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

## Capture network policy

`scripts/capture-site.mjs` refuses credential-bearing URLs and non-public network
targets by default. The address classifier covers private, loopback, link-local,
multicast, documentation, benchmarking, and reserved IPv4/IPv6 ranges, including
IPv4-mapped, NAT64, and 6to4 forms.

The hostname is resolved before capture, but the request performs its own DNS
resolution. A DNS-rebinding target could therefore change address between the
check and the request. Playwright can also load subresources that were not part of
the initial navigation check. Do not treat runtime capture as a network sandbox.
Run it in an isolated environment, use `--allow-private-network` only for an
intentional local audit, and review captured output before sharing it.

## Audit authorisation

Only audit sites and repositories you are authorised to inspect. Runtime capture
must be treated as untrusted: use an isolated browser profile, avoid authenticated
sessions unless explicitly authorised, and never publish captured personal data or
client assets.

## Handling secrets

Never commit credentials, cookies, API keys, or client secrets. Generated
captures must redact sensitive headers and must not include authenticated session
data.
