import mqtt from 'https://esm.sh/mqtt';
import { ready } from 'https://lsong.org/scripts/dom.js';
import { now } from 'https://lsong.org/scripts/time.js';


ready(async () => {
  const server = document.getElementById('server');
  const connect = document.getElementById('connect');
  const disconnect = document.getElementById('disconnect');

  const topic = document.getElementById('topic');
  const subscribe = document.getElementById('subscribe');
  const unsubscribe = document.getElementById('unsubscribe');

  const message = document.getElementById('message');
  const send = document.getElementById('send');

  var client;
  const handleConnect = () => {
    console.log('connected');
    connect.disabled = true;
    disconnect.disabled = false;
    subscribe.disabled = false;
    unsubscribe.disabled = false;
    send.disabled = false;
  };
  const handleDisconnect = () => {
    client = null;
    console.log('disconnected');
    connect.disabled = false;
    disconnect.disabled = true;
    subscribe.disabled = true;
    unsubscribe.disabled = true;
    send.disabled = true;
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
  })
});
