/* ==========================================================================
   Anas Fayed — simple personal page   |   main.js
   All content lives in assets/js/config.js. Plain script, no build step.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var LINKS = CFG.links || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Helpers ---------- */
  function $(sel) { return document.querySelector(sel); }

  /** Create an element with textContent only (never innerHTML). */
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      var u = new URL(value.trim());
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
    } catch (e) { return ""; }
  }
  function emailHref(v) {
    v = typeof v === "string" ? v.trim() : "";
    return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(v) ? "mailto:" + v : "";
  }
  function whatsappHref(num, msg) {
    var d = String(num || "").replace(/\D/g, "");
    if (d.length < 8) return "";
    return "https://wa.me/" + d + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  function pretty(href) {
    try { var u = new URL(href); return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/+$/, ""); }
    catch (e) { return href; }
  }

  var META = {
    whatsapp:  { label: "WhatsApp",  badge: "wa", handle: "Send me a message" },
    linkedin:  { label: "LinkedIn",  badge: "in" },
    instagram: { label: "Instagram", badge: "ig" },
    tiktok:    { label: "TikTok",    badge: "tt" },
    snapchat:  { label: "Snapchat",  badge: "sc" },
    github:    { label: "GitHub",    badge: "gh" },
    email:     { label: "Email",     badge: "@" }
  };

  /* ---------- Content ---------- */
  function renderHero() {
    if (CFG.name) {
      var title = $("#hero-title"), parts = String(CFG.name).trim().split(" ");
      var last = parts.length > 1 ? parts.pop() : "";
      title.textContent = parts.join(" ") + (last ? " " : "");
      if (last) title.appendChild(h("span", { class: "grad", text: last }));
      title.appendChild(h("span", { class: "dot", text: "." }));
    }
    var tag = $("#hero-tag"), intro = $("#hero-intro");
    if (CFG.tagline) tag.textContent = CFG.tagline; else tag.hidden = true;
    if (CFG.intro) intro.textContent = CFG.intro; else intro.hidden = true;
  }

  function renderFacts() {
    var a = CFG.about || {};
    var rows = [
      ["Full name", a.fullName],
      ["Born", a.born],
      ["Birthplace", a.birthplace],
      ["From", a.from],
      ["Studying", a.faculty],
      ["University", a.university],
      ["Expected graduation", a.graduation],
      ["Current stage", a.currentStage]
    ].filter(function (r) { return r[1]; });

    var list = $("#facts");
    if (!rows.length) { $("#about").hidden = true; return; }
    rows.forEach(function (r) {
      list.appendChild(h("div", { class: "fact" }, [h("dt", { text: r[0] }), h("dd", { text: r[1] })]));
    });
  }

  function renderCards() {
    var wrap = $("#cards");
    (CFG.linkOrder || Object.keys(LINKS)).forEach(function (key) {
      var meta = META[key] || { label: key, badge: key.slice(0, 2) };
      var href = key === "whatsapp" ? whatsappHref(LINKS.whatsapp, CFG.whatsappMessage)
               : key === "email" ? emailHref(LINKS.email)
               : safeUrl(LINKS[key]);
      if (!href) return; // missing link → card simply doesn't exist

      var handle = key === "whatsapp" ? meta.handle : key === "email" ? String(LINKS.email).trim() : pretty(href);
      var attrs = { class: "card" + (key === "whatsapp" ? " is-main" : ""), href: href, "aria-label": meta.label + ": " + handle };
      if (/^https?:/i.test(href)) { attrs.target = "_blank"; attrs.rel = "noopener noreferrer"; }

      wrap.appendChild(h("a", attrs, [
        h("span", { class: "badge", "aria-hidden": "true", text: meta.badge }),
        h("span", { class: "card-text" }, [h("span", { class: "card-name", text: meta.label }), h("span", { class: "card-handle mono", text: handle })]),
        h("span", { class: "card-arrow", "aria-hidden": "true", text: "↗" })
      ]));
    });
    if (!wrap.children.length) { $("#links").hidden = true; var l = document.querySelector(".bar-link"); if (l) l.hidden = true; }
  }

  /* ---------- Header + reveal ---------- */
  function initScroll() {
    var header = $("#site-header");
    function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 12); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero network (light, pauses when hidden) ---------- */
  function initNetwork() {
    var canvas = $("#hero-canvas"), hero = $(".hero");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var COLOR = "232,96,122";
    var w = 0, hh = 0, nodes = [], raf = 0, running = false, inView = true, last = 0;

    function rand(a, b) { return a + Math.random() * (b - a); }
    function build() {
      var r = hero.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width)); hh = Math.max(1, Math.floor(r.height));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(hh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(64, Math.max(22, (w * hh) / 20000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        var big = Math.random() < 0.14;
        nodes.push({ x: rand(0, w), y: rand(0, hh), vx: rand(-0.11, 0.11), vy: rand(-0.11, 0.11), r: big ? rand(2.4, 3.3) : rand(1.1, 1.8), big: big });
      }
    }
    function draw(step) {
      ctx.clearRect(0, 0, w, hh);
      var link = Math.min(150, Math.max(95, w * 0.14)), l2 = link * link, i, j, a, b;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (step) {
          a.x += a.vx * step; a.y += a.vy * step;
          if (a.x < -10) a.x = w + 10; else if (a.x > w + 10) a.x = -10;
          if (a.y < -10) a.y = hh + 10; else if (a.y > hh + 10) a.y = -10;
        }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < l2) {
            ctx.strokeStyle = "rgba(" + COLOR + "," + ((1 - d2 / l2) * 0.34).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = "rgba(" + COLOR + "," + (a.big ? 0.95 : 0.55) + ")";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
        if (a.big) { ctx.strokeStyle = "rgba(" + COLOR + ",0.25)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.r + 5, 0, 6.2832); ctx.stroke(); }
      }
    }
    function frame(t) {
      if (!running) return;
      var step = Math.min((t - last) / 16.67, 3); last = t;
      draw(step); raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduceMotion.matches || !inView || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    var timer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { stop(); build(); draw(0); start(); }, 150);
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; if (inView) start(); else stop(); }).observe(hero);
    }
    function onMotion() { if (reduceMotion.matches) { stop(); draw(0); } else start(); }
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onMotion);

    build(); draw(0); start();
  }

  /* ---------- Boot ---------- */
  function boot() {
    var y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());
    renderHero(); renderFacts(); renderCards();
    initScroll(); initNetwork();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
