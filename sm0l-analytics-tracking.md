# Task: Add Generic Analytics Event Tracking to sm0l Theme

## Goal

Add built-in support for click/event tracking to the sm0l Hugo theme, supporting both **Umami** and **Plausible** as analytics providers. The implementation should be generic and provider-agnostic where possible.

## Context

- The theme is `hugo-theme-sm0l`
- Analytics scripts (Umami or Plausible) are already loaded via `layouts/partials/custom-head.html` by the site owner
- The theme currently has no event tracking
- Post title links on list pages use the selector `.posts-list .post-item h3 a` (both in `layouts/index.html` and `layouts/_default/list.html`)

## Requirements

### 1. Configuration via `hugo.toml`

Add a new config section under `[params.analytics]` that lets the site owner choose their provider and which events to track:

```toml
[params.analytics]
    provider = "umami"  # or "plausible" or "" (disabled)
    [params.analytics.events]
        headlineClicks = true   # track clicks on post titles in list views
        tagClicks = true        # track clicks on tag links
        navClicks = true        # track clicks on navigation menu links
        socialClicks = true     # track clicks on social/profile links
        paginationClicks = true # track clicks on pagination links
        replyToClicks = true    # track clicks on "in reply to" links
        commentClicks = true    # track clicks on comment count links
        rssClicks = true        # track clicks on RSS feed link
```

### 2. Analytics Partial

Create a new partial `layouts/partials/analytics-events.html` (or similar) that:

- Checks `params.analytics.provider` and `params.analytics.events`
- Renders a `<script>` block only if a provider is configured and at least one event is enabled
- Abstracts the tracking call behind a helper function so provider differences are handled in one place

The two providers have different JS APIs:
- **Umami**: `umami.track('event-name', { key: value })`
- **Plausible**: `plausible('event-name', { props: { key: value } })`

A thin wrapper like this would work:

```js
function trackEvent(name, props) {
    if (typeof umami !== 'undefined') umami.track(name, props);
    else if (typeof plausible !== 'undefined') plausible(name, { props: props });
}
```

Alternatively, the wrapper could be driven by the `provider` param rather than runtime detection -- either approach is fine.

### 3. Event Definitions

Each event is gated by its corresponding config flag. All use `trackEvent(name, props)`.

#### 3.1 Headline Clicks (`headlineClicks`)
- Selector: `.posts-list .post-item h3 a`
- Event name: `headline-click`
- Properties: `{ title: <link text>, url: <link href> }`

#### 3.2 Tag Clicks (`tagClicks`)
- Selector: `a.tag-link`
- Event name: `tag-click`
- Properties: `{ tag: <link text>, url: <link href> }`

#### 3.3 Navigation Clicks (`navClicks`)
- Selector: `nav a` (both site title and menu items)
- Event name: `nav-click`
- Properties: `{ label: <link text>, url: <link href> }`

#### 3.4 Social Clicks (`socialClicks`)
- Selector: `a.social-link`
- Event name: `social-click`
- Properties: `{ name: <link text or aria-label>, url: <link href> }`

#### 3.5 Pagination Clicks (`paginationClicks`)
- Selector: `a.pagination-link`
- Event name: `pagination-click`
- Properties: `{ label: <link text or aria-label>, url: <link href> }`

#### 3.6 Reply-To Clicks (`replyToClicks`)
- Selector: `a.u-in-reply-to`
- Event name: `reply-to-click`
- Properties: `{ host: <link text>, url: <link href> }`

#### 3.7 Comment Clicks (`commentClicks`)
- Selector: `a[href$="#IDCommentsHead"]`
- Event name: `comment-click`
- Properties: `{ url: <link href> }`

#### 3.8 RSS Click (`rssClicks`)
- Selector: `a[href$="/index.xml"]` or match by link text "RSS feed"
- Event name: `rss-click`
- Properties: `{ url: <link href> }`

### 4. Include the Partial

Include the analytics-events partial in `layouts/partials/footer.html` or `layouts/_default/baseof.html` (before `</body>`), so it loads after the DOM content.

## Current Template Structure (for reference)

### `layouts/index.html` (homepage post list)

```html
<li class="post-item h-entry">
    <h3><a href="{{ .RelPermalink }}" class="p-name u-url">{{ .Title }}</a></h3>
    {{ if .Summary }}
        <p class="post-summary p-summary">{{ .Summary }}</p>
    {{ end }}
    <div class="post-meta">...</div>
</li>
```

### `layouts/_default/list.html` (section/tag list)

```html
<li class="post-item h-entry">
    <h3>
        <a href="{{ .RelPermalink }}" class="p-name u-url">{{ .LinkTitle }}</a>
    </h3>
    {{ if .Summary }}
        <p class="post-summary p-summary">{{ .Summary }}</p>
    {{ end }}
    <div class="post-meta">...</div>
</li>
```

Both use the same CSS classes, so a single selector works for both.

## Out of Scope

- Loading the analytics script itself (that stays in `custom-head.html` on the site side)

## Notes

- Keep it minimal -- no npm dependencies, no build steps, just Hugo partials and inline JS
- The script should handle the case where the analytics provider script hasn't loaded (guard against undefined)
- Use `DOMContentLoaded` or place the script at the end of `<body>` to ensure DOM is ready

## GDPR / Cookie-Consent Note

This feature does **not** set cookies, load additional third-party scripts, or collect personal data. It fires events into an analytics provider (Umami or Plausible) that is already loaded by the site owner. Both providers are designed to be cookieless and are generally considered consent-free under the ePrivacy Directive.

However, event tracking increases the granularity of behavioral data collected (click paths, specific links clicked). Stricter interpretations (e.g. CNIL, Austrian DSB) may argue that any analytics — even cookieless — requires at minimum disclosure in a privacy policy.

**Recommendation for site owners:** Disclose the use of analytics and event tracking in your privacy policy, even if no consent banner is required.
