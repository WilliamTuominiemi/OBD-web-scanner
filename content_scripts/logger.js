(() => {
  if (window.top !== window) return;

  if (window.__contentLoggerRan) return;
  window.__contentLoggerRan = true;

  function injectLogger() {
    const script = document.createElement('script');
    script.textContent = `
    (function() {
      if (window.__loggerInjected) return;
      window.__loggerInjected = true;

      const send = (type, args) => {
        window.postMessage({ type, data: args }, "*");
      };

      const origLog = console.log;
      console.log = function(...args) { send("FROM_PAGE_LOG", args); origLog.apply(console, args); };

      const origWarn = console.warn;
      console.warn = function(...args) { send("FROM_PAGE_WARN", args); origWarn.apply(console, args); };

      const origErr = console.error;
      console.error = function(...args) { send("FROM_PAGE_ERROR", args); origErr.apply(console, args); };
    })();
  `;
    document.documentElement.appendChild(script);
    script.remove();
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const { type, data } = event.data || {};
    if (type && type.startsWith('FROM_PAGE_')) {
      browser.runtime.sendMessage({ logType: type, logData: data }).catch(() => {});
    }
  });

  injectLogger();
})();
