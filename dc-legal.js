/* =====================================================================
   Dream Clean by DC — Legal add-on (cookie consent + legal footer)
   Dream Clean by Dalila Cerezo LLC
   Add to ANY site with ONE line before </body>:
       <script src="/dc-legal.js" defer></script>
   - Injects a bilingual (EN/ES) cookie consent banner.
   - Injects a slim legal-links bar (Privacy · Cookies · Terms · Accessibility).
   - Reads language from localStorage "dc_lang" (en/es), default en.
   - Put your Meta Pixel / Google Analytics inside dcLoadTracking() so they
     only fire AFTER the visitor accepts. Choice stored in localStorage.
   ===================================================================== */
(function () {
  var BASE = "https://www.dreamcleanbydc.com"; // legal pages live on the main site
  var lang = "en";
  try { if (localStorage.getItem("dc_lang") === "es") lang = "es"; } catch (e) {}

  var T = {
    en: {
      msg: "We use cookies to run our site, analyze traffic, and improve our advertising. See our ",
      policy: "Cookie Policy",
      accept: "Accept all",
      reject: "Reject non-essential",
      privacy: "Privacy Policy", cookies: "Cookie Policy",
      terms: "Terms & Conditions", access: "Accessibility"
    },
    es: {
      msg: "Usamos cookies para operar el sitio, analizar el tráfico y mejorar nuestra publicidad. Consulta nuestra ",
      policy: "Política de Cookies",
      accept: "Aceptar todo",
      reject: "Rechazar no esenciales",
      privacy: "Política de Privacidad", cookies: "Política de Cookies",
      terms: "Términos y Condiciones", access: "Accesibilidad"
    }
  }[lang];

  /* ---------- styles ---------- */
  var css = '' +
    '#dc-cookie{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#2C221C;color:#F6F1E9;' +
    'padding:16px 20px;box-shadow:0 -6px 24px rgba(0,0,0,.25);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:none}' +
    '#dc-cookie.show{display:block}' +
    '#dc-cookie .w{max-width:1040px;margin:0 auto;display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between}' +
    '#dc-cookie p{margin:0;font-size:14px;line-height:1.5;flex:1 1 320px}' +
    '#dc-cookie a{color:#C9A24B;text-decoration:none}' +
    '#dc-cookie .b{display:flex;gap:10px;flex-wrap:wrap}' +
    '#dc-cookie button{border:0;border-radius:999px;padding:10px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}' +
    '#dc-cookie .ok{background:#B8933D;color:#2C221C}#dc-cookie .ok:hover{background:#C9A24B}' +
    '#dc-cookie .no{background:transparent;color:#F6F1E9;border:1px solid rgba(246,241,233,.5)}' +
    '#dc-legal-bar{background:#2C221C;color:#C9BEB0;text-align:center;padding:20px 16px;' +
    'font-family:Inter,-apple-system,sans-serif;font-size:12.5px;line-height:1.8}' +
    '#dc-legal-bar a{color:#C9A24B;text-decoration:none;margin:0 7px}#dc-legal-bar a:hover{text-decoration:underline}' +
    '#dc-legal-bar .c{margin-top:10px;color:#9a8d7f}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- legal footer bar ---------- */
  var bar = document.createElement("footer");
  bar.id = "dc-legal-bar";
  bar.innerHTML =
    '<nav aria-label="Legal">' +
    '<a href="' + BASE + '/privacy">' + T.privacy + '</a>·' +
    '<a href="' + BASE + '/cookies">' + T.cookies + '</a>·' +
    '<a href="' + BASE + '/terms">' + T.terms + '</a>·' +
    '<a href="' + BASE + '/accessibility">' + T.access + '</a></nav>' +
    '<div class="c">© 2026 Dream Clean by Dalila Cerezo LLC · Dream Clean by DC · Orlando, Central Florida · Licensed · Insured</div>';
  document.body.appendChild(bar);

  /* ---------- cookie consent ---------- */
  var KEY = "dc_cookie_consent";
  function get(){ try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v){ try { localStorage.setItem(KEY, v); } catch (e) {} }

  window.dcLoadTracking = function () {
    if (window.__dcTrackingLoaded) return; window.__dcTrackingLoaded = true;
    /* >>> Paste your Meta Pixel and Google Analytics snippets here <<< */
  };

  var box = document.createElement("div");
  box.id = "dc-cookie";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Cookie consent");
  box.innerHTML =
    '<div class="w"><p>' + T.msg + '<a href="' + BASE + '/cookies">' + T.policy + '</a>.</p>' +
    '<div class="b"><button class="no" id="dc-no">' + T.reject + '</button>' +
    '<button class="ok" id="dc-ok">' + T.accept + '</button></div></div>';
  document.body.appendChild(box);

  function show(){ box.classList.add("show"); }
  function hide(){ box.classList.remove("show"); }
  document.getElementById("dc-ok").addEventListener("click", function(){ set("all"); hide(); window.dcLoadTracking(); });
  document.getElementById("dc-no").addEventListener("click", function(){ set("essential"); hide(); });
  window.dcOpenCookiePrefs = function(){ show(); };

  var c = get();
  if (c === "all") window.dcLoadTracking();
  else if (c !== "essential") show();
})();
