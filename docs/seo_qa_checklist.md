# SEO QA Checklist

Use these commands to verify pre-rendered HTML contains the expected SEO elements. Run against the live site or a local preview.

**Base URL:** `https://tripointdiagnostics.co.uk`

## View Source vs Rendered DOM

- **View Source** (Ctrl+U / Cmd+Option+U): Shows the raw HTML sent by the server. This is what Googlebot sees.
- **Rendered DOM** (DevTools Elements): Shows the DOM after JavaScript runs. For SSG, both should match for indexable content.

For SEO verification, always use **View Source** or `curl` to confirm the initial HTML contains the content.

---

## Curl Verification Commands

### 1. H1 exists in response HTML

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -i "<h1"
curl -s https://tripointdiagnostics.co.uk/services/mercedes-xentry-diagnostics-coding/ | grep -i "<h1"
curl -s https://tripointdiagnostics.co.uk/areas-covered/tonbridge/ | grep -i "<h1"
```

Expected: Each returns at least one `<h1>` tag with page-specific content.

### 2. Meta description exists

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -i 'meta name="description"'
curl -s https://tripointdiagnostics.co.uk/services/ | grep -i 'meta name="description"'
```

Expected: Each returns a `<meta name="description" content="...">` with unique content per page.

### 3. Canonical link exists

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -i 'rel="canonical"'
curl -s https://tripointdiagnostics.co.uk/services/mercedes-xentry-diagnostics-coding/ | grep -i 'rel="canonical"'
```

Expected: Each returns `<link rel="canonical" href="https://tripointdiagnostics.co.uk/...">` with correct path.

### 4. Open Graph tags exist

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -i 'property="og:'
curl -s https://tripointdiagnostics.co.uk/services/ | grep -i 'property="og:'
```

Expected: Returns `og:title`, `og:description`, `og:type`, `og:url`, `og:image` at minimum.

### 5. Twitter card tags exist

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -i 'name="twitter:'
```

Expected: Returns `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.

### 6. JSON-LD exists and is valid

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -o '<script type="application/ld+json">[^<]*</script>' | head -1
```

Expected: Returns at least one JSON-LD block. Validate at [Google Rich Results Test](https://search.google.com/test/rich-results) or [Schema.org Validator](https://validator.schema.org/).

### 7. Robots meta (max-image-preview:large)

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -i 'name="robots"'
```

Expected: On indexable pages, returns `content="index, follow, max-image-preview:large"`. On noindex pages (e.g. 404), returns `noindex,nofollow`.

### 8. hreflang exists

```bash
curl -s https://tripointdiagnostics.co.uk/ | grep -i 'hreflang'
```

Expected: Returns `hreflang="en-GB"` and `hreflang="x-default"` links.

---

## Key Pages to Verify

| Page | Path | H1 should contain |
|------|------|-------------------|
| Home | `/` | Mobile Vehicle Diagnostics |
| Services | `/services` | Services |
| Mercedes XENTRY | `/services/mercedes-xentry-diagnostics-coding` | Mercedes Xentry |
| Areas Covered | `/areas-covered` | Where We Cover |
| Tonbridge | `/areas-covered/tonbridge` | Tonbridge |
| 404 | Any non-existent path | 404 or Page Not Found |

---

## Sitemap and Robots

```bash
curl -s https://tripointdiagnostics.co.uk/robots.txt
curl -s https://tripointdiagnostics.co.uk/sitemap.xml | head -50
```

Expected:
- `robots.txt`: Allows `/`, disallows `/admin`, `/pay`, references sitemap.
- `sitemap.xml`: Contains indexable URLs only. No `/404`, no `/admin`, no `/pay`.

---

## 404 Handling

```bash
curl -sI https://tripointdiagnostics.co.uk/nonexistent-page-xyz
```

Expected: HTTP 404 status. Body should contain custom 404 page content (not SPA fallback to homepage).

---

## Tracking (Manual Check)

After deployment, verify in browser:

1. **gtag loads:** Network tab shows request to `googletagmanager.com/gtag/js`.
2. **page_view fires:** On initial load and on SPA navigation (RouteTracker).
3. **Conversions fire:** Submit contact form or complete booking flow; check GA4/Google Ads for conversion events.
