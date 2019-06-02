import { ContextObject } from './Context';
import { namespace } from './helpers/namespace';

export function setContextValue<K, V>(key: string, value: V): V;
export function setContextValue<V extends ContextObject>(values: V): V;
export function setContextValue(keyOrValues: string | ContextObject, value?: any) {
  if (typeof keyOrValues === 'string') {
    namespace.set(keyOrValues, value);
    return value;
  } else {
    Object.entries(keyOrValues).forEach(([key, val]) => {
      setContextValue(key, val);
    });

    return keyOrValues;
  }
}

export function getContextValue<T>(key: string): T {
  return namespace.get(key);
}

export function hasContextValue(key: string): boolean {
  return namespace.active.hasOwnProperty(key);
}

export function deleteContextValue(key: string): void {
  delete namespace.active[key];
}

export function getAllContextValues<T extends ContextObject>(): T {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _ns_name, id, ...values } = namespace.active;
  return Object.assign({}, values);
}
