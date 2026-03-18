import EventEmitter from 'node:events';

class PubSub extends EventEmitter {}

const pubSub = new PubSub();

// Publisher
function publishMessage(topic, message) {
  pubSub.emit(topic, message);
}

// Subscribers
pubSub.on('news', (message) => {
  console.log(`[Subscriber 1] News received:`, message);
});

pubSub.on('news', (message) => {
  console.log(`[Subscriber 2] News received:`, message);
});

pubSub.on('alerts', (alert) => {
  console.log(`[Alert Subscriber] Alert:`, alert);
});

console.log('Publishing news and alerts:');

publishMessage('news', 'Breaking: Node.js is awesome!');
publishMessage('news', 'Update: EventEmitter makes pub/sub easy');
publishMessage('alerts', 'High memory usage detected');

console.log('Publishing more news:');

publishMessage('news', 'Last message of the day');
