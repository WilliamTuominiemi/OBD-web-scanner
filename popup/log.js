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

  div.textContent = `[${type.replace('FROM_PAGE_', '').toLowerCase()}] ${JSON.stringify(data)}`;

  div.id = self.crypto.randomUUID();

  div.onclick = () => logClicked(data, div.id);

  logContainer.appendChild(div);
}

async function logClicked(data, id) {
  const logEntry = document.getElementById(id);
  const p = logEntry.querySelector('p');

  if (logEntry.classList.contains('expanded')) {
    logEntry.className = 'log-entry';

    if (p) {
      p.style.display = 'none';
    }
  } else {
    logEntry.className = 'log-entry expanded';

    if (p) {
      p.style.display = 'block';
    } else {
      const new_p = document.createElement('p');
      new_p.textContent = await askAI(data);
      logEntry.appendChild(new_p);
    }
  }
}

async function askAI(data) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const apiKey = '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': `${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Explain briefly with a few sentences what is going on in this devtools log ${JSON.stringify(
                  data
                )}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(error.message);
  }
}
