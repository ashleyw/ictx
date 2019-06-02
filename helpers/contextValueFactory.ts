import { namespace } from './namespace';

export function contextValueFactory<V = any>(key: string, defaultValue: any = null): (value?: V) => V {
  return function<T>(value?: T): T {
    if (value) {
      namespace.set(key, value);
    }

    return namespace.get(key) || defaultValue;
  };
}
