# Vijaya Construction

Static website for Vijaya Construction, focused on luxury flats in Guwahati, premium residential projects in Assam, AREIDA membership, RERA-visible project facts, and direct sales enquiries.

## Build

```sh
node scripts/build-site.mjs
```

The site is static HTML/CSS/JS and currently has zero serverless functions.

## Security

Security headers are generated into both `vercel.json` and `_headers` for common static hosts. A CSP meta fallback is also emitted into every generated page.
