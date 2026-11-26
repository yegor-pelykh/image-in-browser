<!-- @format -->

# Security Policy

## Supported versions

Security fixes are provided for the latest published release in the current
major version. Older major versions are not supported; please upgrade before
reporting an issue.

| Version              | Supported |
| :------------------- | :-------- |
| 3.x (latest release) | ✅        |
| < 3.0                | ❌        |

## Reporting a vulnerability

Please do not open a public issue, discussion, or pull request for a security
problem. Report it privately to **yegor.dev@gmail.com**.

Include as much of the following as you can:

- the affected version(s) of `image-in-browser`;
- the environment: browser or Node.js version, operating system, and bundler if
  relevant;
- a description of the impact and the affected API, decoder, or encoder;
- minimal reproduction steps or a proof of concept;
- the error output or stack trace;
- a sample image if the problem is triggered by a crafted file (keep it as small
  as possible and remove sensitive content);
- any suggested fix or mitigation.

Do not include credentials, personal data, or other secrets. If you need to
share a large file, mention it in the first email so we can arrange a suitable
channel. If you are unsure whether something is a security issue, report it
privately anyway.

## What to expect

This project is maintained in spare time. I will acknowledge the report as soon
as possible, investigate it, and keep you informed about the fix and release.
Timelines depend on severity and complexity.

Please allow a reasonable amount of time for a fix before disclosing the issue
publicly. If you want, I will credit you in the release notes or advisory.

## Scope

In scope:

- out-of-bounds reads from binary buffers, integer overflows, and incorrect
  length or bounds checks in the hand-written codecs;
- denial of service through malformed or oversized images, including bypasses of
  the max-pixels budget (`defaultMaxPixels = 2^28`);
- incorrect validation that lets malformed input throw an unexpected error
  instead of `LibError`, or crash the Node.js process;
- vulnerabilities in the published runtime code.

Out of scope:

- vulnerabilities in applications that use `image-in-browser`;
- issues that only affect unsupported versions;
- problems that require a compromised environment or privileges the attacker
  already has;
- social engineering, spam, or physical attacks;
- vulnerabilities in development-only dependencies, unless they affect the
  published package.

## Guidelines

- Act in good faith and avoid accessing, changing, or destroying data that does
  not belong to you.
- Use your own test images and accounts.
- Do not run automated scans that degrade the service or spam the issue tracker.
- Keep the report private until a fix has been released and disclosure has been
  coordinated.

## Disclosure

After a fix is available, I may publish a GitHub Security Advisory describing
the issue and the affected versions. I will coordinate the disclosure date with
you and credit you unless you prefer to stay anonymous.
