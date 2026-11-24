//* Immediately Invoked Function Expression (IIFE) - Function is created, Immediately executed
void (function (f, b, e, v, n, t, s) {
  if (f.fbq) return; // PREVENTS DOUBLE INITIALIZATION - IF META PIXEL ALREADY EXISTS, STOP EXECUTION, AVOID DUPLICATE LOADING
  //  CREATE fbq FUNCTION - MAIN META PIXEL FUNCTION
  n = f.fbq = function () {
    if (n.callMethod) {
      n.callMethod.apply(n, arguments);
    } else {
      n.queue.push(arguments);
    }
  };
  if (!f._fbq) f._fbq = n; // BACK UP VARIABLE

  // META DATA
  n.push = n;
  n.loaded = !0; // n.loaded = true; - LOADED STATUS
  n.version = "2.0";
  n.queue = [];

  t = b.createElement(e); // CREATE SCRIPT TAG - <script></script>
  t.async = !0; // LOADED SCRIPT ASYNCHRONOUSLY - t.async = true; - don't block page rendering - load in background
  t.src = v; // SET FACEBOOK SCRIPT URL

  s = b.getElementsByTagName(e)[0]; // FIND FIRST SCRIPT TAG

  // INSERT SCRIPT INTO DOM
  if (s && s.parentNode) {
    s.parentNode.insertBefore(t, s);
  }
})(
  // EXECUTE THE WHOLE SET UP
  window, // f
  document, // b
  "script", // e
  "https://connect.facebook.net/en_US/fbevents.js", // v = Facebook JS URL
);

// Protects app from crashing if: script fails, pixel missing, browser issues
try {
  var current = document.currentScript; // GET CURRENT SCRIPT
  // READ PIXEL ID
  var pixelId =
    (current && current.getAttribute("data-pixel-id")) ||
    (document.getElementById("fb-pixel") &&
      document.getElementById("fb-pixel").getAttribute("data-pixel-id"));

  // IF PIXEL ID EXISTS AND fbq FUNCTION LOADED
  if (pixelId && window.fbq) {
    window.fbq("init", pixelId); // THEN INITIALIZE PIXEL ID - THIS CONNECT THE WEBSITE WITH THE META PIXEL ACCOUNT
    window.fbq("track", "PageView"); // AND TRACK PAGE VIEW - MOST BASIC TRACKING
  } else {
    console.warn(
      "[Meta Pixel] Missing Pixel ID (NEXT_PUBLIC_FACEBOOK_PIXEL_ID) or fbq not ready", // IF ENV VARIABLE MISSING, OR PIXEL ID UNDEFINED
    );
  }
} catch (e) {
  console.warn("[Meta Pixel] Failed to initialize", e); // HANDLES UNWANTED FAILURE
}
