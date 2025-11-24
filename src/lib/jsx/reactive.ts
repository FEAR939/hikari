// reactive.ts
type Subscriber = () => void;

export function createSignal<T>(initialValue: T) {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  const read = () => value;

  const write = (newValue: T) => {
    value = newValue;
    subscribers.forEach((fn) => fn());
  };

  const subscribe = (fn: Subscriber) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  return [read, write, subscribe] as const;
}

export function bind<T>(
  signal: readonly [() => T, any, (fn: Subscriber) => () => void],
  render: (value: T) => Node,
) {
  const [read, , subscribe] = signal;
  let currentNode = render(read());

  subscribe(() => {
    const newNode = render(read());
    currentNode.replaceWith(newNode);
    currentNode = newNode;
  });

  return currentNode;
}
