const logContainer = document.getElementById('logs');

browser.runtime.sendMessage({ type: 'GET_LOGS' }).then((savedLogs) => {
  savedLogs.forEach((log) => addLog(log.type, log.data));
});

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'NEW_LOG') {
    addLog(message.logType, message.logData);
  }
});

function addLog(type, data) {
  const div = document.createElement('div');
  div.className = 'log-entry';

  if (type === 'FROM_PAGE_LOG') {
    div.style.color = 'black';
  } else if (type === 'FROM_PAGE_WARN') {
    div.style.color = 'orange';
  } else if (type === 'FROM_PAGE_ERROR') {
    div.style.color = 'red';
  }

  div.textContent = `[${type.replace('FROM_PAGE_', '').toLowerCase()}] ${data.join(' ')}`;
  logContainer.appendChild(div);
}
