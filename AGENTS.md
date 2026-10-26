# Project conventions
- Use the shared navigation and footer logo import for the brand, and derive browser/PWA icons from that same logo so branding stays consistent.
- Treat serving domains, email addresses, deployed service names, and legacy storage keys as operational identifiers; change them only with a confirmed migration so rebranding does not break integrations or stored preferences.
- Route all product demo requests through the shared enquiry form and provider; it submits to the contact email function without opening demo URLs.
- Demo enquiries are validated and stored server-side in contact_submissions before owner email delivery; only report acknowledgement after a successful send.
- Keep crawler-visible homepage canonical and social URLs in index.html, marked data-rh="true" so Helmet replaces them on navigation instead of creating conflicting duplicates.
