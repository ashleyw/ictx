import { omit } from 'lodash';

import { ContextObject } from './Context';
import { namespace } from './helpers/namespace';

export function setContextValue<K, V>(key: string, value: any): V;
export function setContextValue<V>(values: ContextObject): V;
export function setContextValue(keyOrValues: string | ContextObject, value?: any) {
  if (typeof keyOrValues === 'string') {
    namespace.set(keyOrValues, value);
  } else {
    Object.entries(keyOrValues).forEach(([key, val]) => {
      setContextValue(key, val);
    });
  }
  return value;
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
  return omit(namespace.active, ['_ns_name', 'id'])
}
