import mqtt from 'https://esm.sh/mqtt';
import { ready } from 'https://lsong.org/scripts/dom/index.js';
import { now } from 'https://lsong.org/scripts/datetime/time.js';

ready(async () => {
  const server = document.getElementById('server');
  const connect = document.getElementById('connect');
  const disconnect = document.getElementById('disconnect');

  const topic = document.getElementById('topic');
  const subscribe = document.getElementById('subscribe');
  const unsubscribe = document.getElementById('unsubscribe');

  const message = document.getElementById('message');
  const send = document.getElementById('send');
  const output = document.getElementById('output');
  const quickActions = document.getElementById('quick-actions');
  const quickActionForm = document.getElementById('quick-action-form');
  const addQuickAction = document.getElementById('add-quick-action');
  const cancelQuickAction = document.getElementById('cancel-quick-action');
  const quickLabel = document.getElementById('quick-label');
  const quickTopic = document.getElementById('quick-topic');
  const quickMessage = document.getElementById('quick-message');
  const QUICK_ACTIONS_KEY = 'mqtt-quick-actions';

  let quickActionItems = [];
  try {
    quickActionItems = JSON.parse(localStorage.getItem(QUICK_ACTIONS_KEY) || '[]');
    if (!Array.isArray(quickActionItems)) quickActionItems = [];
  } catch {
    quickActionItems = [];
  }

  const renderQuickActions = () => {
    quickActions.replaceChildren();
    quickActionItems.forEach((item, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'quick-action';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quick-send-button';
      button.textContent = item.label;
      button.title = `${item.topic}: ${item.message}`;
      button.disabled = !client;
      button.addEventListener('click', () => {
        if (client) client.publish(item.topic, item.message);
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'quick-action-remove';
      remove.textContent = '×';
      remove.title = `Remove ${item.label}`;
      remove.setAttribute('aria-label', `Remove ${item.label}`);
      remove.addEventListener('click', () => {
        quickActionItems.splice(index, 1);
        saveQuickActions();
      });
      wrapper.append(button, remove);
      quickActions.appendChild(wrapper);
    });
  };

  const saveQuickActions = () => {
    localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(quickActionItems));
    renderQuickActions();
  };

  var client;
  const handleConnect = () => {
    console.log('connected');
    connect.disabled = true;
    disconnect.disabled = false;
    subscribe.disabled = false;
    unsubscribe.disabled = false;
    send.disabled = false;
    renderQuickActions();
  };
  const handleDisconnect = () => {
    client = null;
    console.log('disconnected');
    connect.disabled = false;
    disconnect.disabled = true;
    subscribe.disabled = true;
    unsubscribe.disabled = true;
    send.disabled = true;
    renderQuickActions();
  };
  const handleMessage = (topic, message) => {
    const li = document.createElement('li');
    li.setAttribute('data-topic', topic);
    li.setAttribute('data-time', now());
    li.textContent = message.toString();
    output.appendChild(li);
    output.scrollTop = output.scrollHeight;
  };
  connect.addEventListener('click', () => {
    client = mqtt.connect(server.value);
    client.on('connect', handleConnect);
    client.on('end', handleDisconnect);
    client.on('message', handleMessage);
  });
  disconnect.addEventListener('click', () => {
    client.end();
  });
  subscribe.addEventListener('click', () => {
    client.subscribe(topic.value);
  });
  unsubscribe.addEventListener('click', () => {
    client.unsubscribe(topic.value);
  });
  send.addEventListener('click', () => {
    client.publish(topic.value, message.value);
  });
  addQuickAction.addEventListener('click', () => {
    quickActionForm.hidden = false;
    quickLabel.focus();
  });
  cancelQuickAction.addEventListener('click', () => {
    quickActionForm.reset();
    quickActionForm.hidden = true;
  });
  quickActionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    quickActionItems.push({
      label: quickLabel.value.trim(),
      topic: quickTopic.value.trim(),
      message: quickMessage.value,
    });
    saveQuickActions();
    quickActionForm.reset();
    quickActionForm.hidden = true;
  });
  renderQuickActions();
});
