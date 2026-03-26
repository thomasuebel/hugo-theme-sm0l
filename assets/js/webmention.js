(function () {
  'use strict';

  var container = document.getElementById('webmentions');
  if (!container) return;

  var target = container.getAttribute('data-page-url');
  if (!target) return;

  var token = container.getAttribute('data-token');
  var api = 'https://webmention.io/api/mentions.jf2';
  var url = api + '?target=' + encodeURIComponent(target) + '&per-page=200&sort-by=published&sort-dir=up';
  if (token) url += '&token=' + encodeURIComponent(token);

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) { render(data.children || []); })
    .catch(function () {});

  function render(mentions) {
    if (!mentions.length) return;

    var intro = document.getElementById('wm-intro');
    if (intro) intro.hidden = true;

    var reactions = [];
    var comments = [];

    mentions.forEach(function (m) {
      var prop = m['wm-property'];
      if (prop === 'like-of' || prop === 'repost-of' || prop === 'bookmark-of') {
        reactions.push(m);
      } else {
        comments.push(m);
      }
    });

    if (reactions.length) {
      container.appendChild(buildReactions(reactions));
    }
    if (comments.length) {
      container.appendChild(buildComments(comments));
    }
  }

  function buildReactions(items) {
    var likes = items.filter(function (m) { return m['wm-property'] === 'like-of'; });
    var reposts = items.filter(function (m) { return m['wm-property'] === 'repost-of'; });
    var bookmarks = items.filter(function (m) { return m['wm-property'] === 'bookmark-of'; });

    var section = el('div', 'wm-reactions');

    if (likes.length) {
      section.appendChild(buildFacepile(likes, likes.length + (likes.length === 1 ? ' like' : ' likes')));
    }
    if (reposts.length) {
      section.appendChild(buildFacepile(reposts, reposts.length + (reposts.length === 1 ? ' repost' : ' reposts')));
    }
    if (bookmarks.length) {
      section.appendChild(buildFacepile(bookmarks, bookmarks.length + (bookmarks.length === 1 ? ' bookmark' : ' bookmarks')));
    }

    return section;
  }

  function buildFacepile(mentions, label) {
    var group = el('div', 'wm-facepile');

    var labelEl = el('span', 'wm-facepile-label');
    labelEl.textContent = label;
    group.appendChild(labelEl);

    var faces = el('span', 'wm-faces');
    mentions.forEach(function (m) {
      var author = m.author || {};
      var link = el('a', 'wm-face');
      link.href = safeUrl(author.url || m.url);
      link.rel = 'nofollow ugc';
      link.title = author.name || 'Anonymous';

      if (author.photo) {
        var img = document.createElement('img');
        img.src = author.photo;
        img.alt = author.name || 'Anonymous';
        img.loading = 'lazy';
        img.decoding = 'async';
        link.appendChild(img);
      } else {
        link.textContent = (author.name || '?').charAt(0).toUpperCase();
        link.classList.add('wm-face--no-photo');
      }

      faces.appendChild(link);
    });
    group.appendChild(faces);

    return group;
  }

  function buildComments(items) {
    var section = el('div', 'wm-comments');

    var heading = el('h2', 'wm-heading');
    heading.textContent = 'Responses';
    section.appendChild(heading);

    var list = el('ul', 'wm-comment-list');
    items.forEach(function (m) {
      var author = m.author || {};
      var li = el('li', 'wm-comment');

      var header = el('div', 'wm-comment-header');

      if (author.photo) {
        var img = document.createElement('img');
        img.src = author.photo;
        img.alt = author.name || 'Anonymous';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.className = 'wm-comment-avatar';
        header.appendChild(img);
      }

      var nameLink = el('a', 'wm-comment-author');
      nameLink.href = safeUrl(author.url || m.url);
      nameLink.rel = 'nofollow ugc';
      nameLink.textContent = author.name || domainFrom(m.url);
      header.appendChild(nameLink);

      if (m.published) {
        var time = el('time', 'wm-comment-date');
        time.setAttribute('datetime', m.published);
        time.textContent = fmtDate(m.published);
        header.appendChild(time);
      }

      li.appendChild(header);

      var content = m.content;
      if (content && content.text) {
        var body = el('p', 'wm-comment-body');
        body.textContent = truncate(content.text, 300);
        li.appendChild(body);
      }

      var source = el('a', 'wm-comment-source');
      source.href = safeUrl(m.url);
      source.rel = 'nofollow ugc';
      source.textContent = 'View original';
      li.appendChild(source);

      list.appendChild(li);
    });

    section.appendChild(list);
    return section;
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function safeUrl(url) {
    if (url && /^https?:\/\//.test(url)) return url;
    return '#';
  }

  function domainFrom(url) {
    try { return new URL(url).hostname; } catch (e) { return 'Anonymous'; }
  }

  function fmtDate(str) {
    try {
      return new Date(str).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) { return str; }
  }

  function truncate(text, max) {
    if (text.length <= max) return text;
    return text.substring(0, max).replace(/\s+\S*$/, '') + '\u2026';
  }
})();
