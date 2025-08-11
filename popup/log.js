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

  div.onclick = () => logClicked(type, data);

  logContainer.appendChild(div);
}

function logClicked(type, data) {
  console.log(`Log clicked: ${type}`, data);

  askAI(data);
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
                text: `Explain what is going on in this devtools log ${JSON.stringify(data)}`,
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
    console.log(result.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error(error.message);
  }
}
