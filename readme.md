# Hugo "Sm0l" Theme

A small theme for HUGO static site generator, 
focused on semantic HTML and accessibility and readability.

# Using Sm0l

inside your HUGO project folder

```
git submodule add https://github.com/thomasuebel/hugo-theme-sm0l.git themes/sm0l
```

add 

```
theme = 'sm0l'
```

Built with help from [Eric Murphy's HUGO Starter Theme](https://github.com/ericmurphyxyz/hugo-starter-theme). 
To learn more about building themes in Hugo, refer to Hugo's [templating documentation](https://gohugo.io/templates/).

# IndieWeb

The theme is built around the idea that the IndieWeb needs all the support it can get. The
Author information that you put in your configuration is rendered as an IndieWeb h-card.
Into your sites index file.

# Base Config
```
baseURL = 'https://yourwebsite.com/'
title = "Your title here"
theme = 'sm0l'
enableRobotsTXT = true
``` 

# Author Information
```
[params.author]
name = "your name"
avatar = "/images/avatar.png"
bio = "Short bio or description"          # optional, hidden p-note in h-card (machine-readable only)
email = "you@example.com"                 # optional, hidden u-email in h-card (machine-readable only)
cv = "/files/cv.pdf"                      # optional, emits <link rel="cv"> in <head>
```

# Avatar

Place your avatar image PNG into your assets/images/ directory as avatar.png. It will override the
themes avatar image.

# IntenseDebate Comments

To enable IntenseDebate commenting system, add your IntenseDebate account ID to your hugo.toml:

```
[params.intensedebate]
acct = "your_intensedebate_account_id"
```

Once enabled, comment counts will appear on:
- Post listing pages (list.html) next to the publication date
- Individual post pages (post-metadata.html) in the metadata section
- Full comment threads will appear at the bottom of individual posts

To get your IntenseDebate account ID, sign up at https://intensedebate.com and find your account ID in your dashboard.

# Webmention

Webmention is a W3C standard that enables cross-site conversations on the indie web. When someone replies to, likes, or reposts one of your blog posts from their own site, a webmention notifies you so you can display that interaction.

Static sites can't receive POST requests directly, so the theme integrates with [webmention.io](https://webmention.io), a free hosted service that collects webmentions on your behalf.

## Setup

1. Sign in at [webmention.io](https://webmention.io) with your domain. Your site needs a `rel="me"` link pointing to a verified profile (the theme already adds `rel="me"` to social links configured in `params.social`).

2. Add the webmention config to your `hugo.toml`:

```toml
[params.webmention]
domain = "yourdomain.com"
token = "your_webmention_io_api_token"
intro = true   # optional, default true — shows an IndieWeb intro when a post has no webmentions yet
```

You can find your API token on your [webmention.io settings page](https://webmention.io/settings) after signing in.

This does three things:
- Adds `<link rel="webmention">` and `<link rel="pingback">` discovery tags to your `<head>` so other sites (and legacy Pingback clients) can find your endpoints.
- Loads a small script on each post page that fetches and displays received webmentions from the webmention.io API.
- Uses your API token to authenticate requests to the webmention.io API.

## What gets displayed

Webmentions are shown at the bottom of individual blog posts, below the article content. They are grouped into two sections:

- **Reactions** (likes, reposts, bookmarks) appear as a row of author avatars (facepile) with a count label.
- **Responses** (replies, mentions) appear as a comment list with author name, avatar, date, a text preview, and a link to the original source.

## Using alongside IntenseDebate

Webmention and IntenseDebate are independent. You can enable one, the other, or both. When both are configured, IntenseDebate comments appear first, followed by webmentions.

## Microformats

Blog posts are marked up with [Microformats2](https://microformats.org) h-entry properties:

| Property | Where | Description |
|---|---|---|
| `h-entry` | `<article>` | Marks the post as an h-entry |
| `p-name` | post title | Name of the post |
| `e-content` | post body | Full content of the post |
| `dt-published` | publish date | ISO8601 datetime with timezone |
| `u-url` | hidden link | Canonical URL of the post |
| `p-author h-card` | post metadata | Nested author card |
| `p-category` | tag links | Post tags |
| `p-summary` | summary | Post summary if present |
| `u-in-reply-to` | hidden link | URL this post replies to (see below) |

This means when you link to someone else's post, their site can parse rich author and content information from yours — making your outbound webmentions more useful across the indie web.

# Reply Posts (u-in-reply-to)

To mark a post as a reply to another URL, add `in_reply_to` to the post's front matter. This renders as a hidden `<a class="u-in-reply-to" rel="in-reply-to">` inside the h-entry, readable by webmention and microformat parsers but not shown to readers.

Single reply:

```toml
+++
title = "Thoughts on your post"
date = 2026-03-25T14:00:00+01:00
in_reply_to = "https://example.com/some-post"
+++

My response here...
```

Reply to multiple posts:

```toml
+++
title = "Responding to both of you"
date = 2026-03-25T14:00:00+01:00
in_reply_to = [
  "https://alice.example/post-one",
  "https://bob.example/post-two"
]
+++

My response here...
```

When webmention is configured, sending a webmention to the target URL(s) will notify those sites that you have replied.

# Performance

## Apache: caching

The theme's CSS is fingerprinted (content hash in the filename), which means the file can be cached indefinitely — the URL changes automatically whenever the CSS changes. To take advantage of this, configure your Apache server to set long cache headers for static assets.

Add the following to your site's `.htaccess` or vhost config:

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css                  "access plus 1 year"
    ExpiresByType application/javascript    "access plus 1 year"
    ExpiresByType image/webp                "access plus 1 year"
    ExpiresByType image/png                 "access plus 1 year"
    ExpiresByType image/jpeg                "access plus 1 year"
</IfModule>
<IfModule mod_headers.c>
    <FilesMatch "\.(css|js|webp|png|jpg|jpeg|woff2)$">
        Header set Cache-Control "max-age=31536000, immutable"
    </FilesMatch>
</IfModule>
```

This is safe because Hugo will never serve a cached stale CSS file — a changed stylesheet always gets a new URL.