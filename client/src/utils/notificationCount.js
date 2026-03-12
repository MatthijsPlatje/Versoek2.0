// client/src/utils/notificationCount.js
let count = 0;
const listeners = new Set();

export function setCount(newCount) {
  count = newCount;
  listeners.forEach((cb) => cb(count));
}

export function onCountChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getCount() {
  return count;
}
