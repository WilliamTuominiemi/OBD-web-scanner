let logs = [];

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.logType) {
    logs.push({ type: message.logType, data: message.logData });

    browser.runtime
      .sendMessage({
        type: 'NEW_LOG',
        logType: message.logType,
        logData: message.logData,
      })
      .catch(() => {});
  }

  if (message.type === 'GET_LOGS') {
    return Promise.resolve(logs);
  }
});
