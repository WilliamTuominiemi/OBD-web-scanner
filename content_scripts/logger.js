function injectLogger() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      let originalLog = console.log;
      let originalWarn = console.warn;
      let originalError = console.error;

      console.log = function(...args) {
        window.postMessage({ type: "FROM_PAGE_LOG", data: args }, "*");
        originalLog.apply(console, args);
      };
      console.warn = function(...args) {
        window.postMessage({ type: "FROM_PAGE_WARN", data: args }, "*");
        originalWarn.apply(console, args);
      };
      console.error = function(...args) {
        window.postMessage({ type: "FROM_PAGE_ERROR", data: args }, "*");
        originalError.apply(console, args);
      };
    })();
  `;
  document.documentElement.appendChild(script);
  script.remove();
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type && event.data.type === 'FROM_PAGE_LOG') {
    console.log('Page log intercepted:', event.data.data);
  }
  if (event.data.type && event.data.type === 'FROM_PAGE_WARN') {
    console.warn('Page warning intercepted:', event.data.data);
  }
  if (event.data.type && event.data.type === 'FROM_PAGE_ERROR') {
    console.error('Page error intercepted:', event.data.data);
  }
});

injectLogger();
