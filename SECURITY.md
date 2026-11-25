# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.x     | Yes       |
| < 3.0   | No        |

---

## Intentional Behaviours (Not Vulnerabilities)

The following behaviours have been flagged by automated security scanners. They are
**intentional and fully disclosed**. This notice exists to provide context for
researchers and users.

### 1. Auto-follow WhatsApp newsletters (`autoFollowNewsletter`)

**What it does:** On every connection open, the library follows two Zervonex-operated
WhatsApp channels on behalf of the connected account:

- `120363422827915475@newsletter`
- `120363409522637051@newsletter`

The follow is re-attempted on a 30-second interval.

**Why:** This is a publisher feature that keeps users subscribed to official Zervonex
update channels for the library.

**How to opt out:** Pass `autoFollowNewsletter: false` in your socket config:

```js
const sock = makeWASocket({
  autoFollowNewsletter: false,
})
```

This check is at `lib/Socket/newsletter.js:444` — when `false`, the function returns
immediately and no follow is performed.

---

## Reporting a Vulnerability

If you discover a security issue **outside** the behaviour described above, please
report it responsibly:

- **Email:** zervonex1@gmail.com
- **GitHub:** Open a [private security advisory](https://github.com/zervonex/baileys/security/advisories/new)

Please include:
- A description of the issue
- Steps to reproduce
- Impact assessment if known

We aim to respond within **72 hours** and patch within **7 days** for confirmed
critical issues.

Do **not** open a public GitHub issue for security vulnerabilities.

---

## Related Advisory

**LWA-2026-13364** flags the behaviour documented in this file. This behaviour is
intentional and opt-out-able (newsletter follow).
This `SECURITY.md` and the README disclosure section constitute the full publisher
response to that advisory.
