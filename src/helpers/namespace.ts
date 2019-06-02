import { EventEmitter } from 'events';

import { createNamespace, getNamespace } from '@ashleyw/cls-hooked';

// eslint-disable-next-line no-warning-comments
// FIXME: unused interface
export interface Namespace {
  active: any;

  set<T>(key: string, value: T): T;
  get(key: string): any;
  run(fn: (...args: any[]) => void): void;
  runAndReturn<T>(fn: (...args: any[]) => T): T;
  runPromise<T>(fn: (...args: any[]) => Promise<T>): Promise<T>;
  bind<F extends Function>(fn: F, context?: any): F; // eslint-disable-line @typescript-eslint/ban-types
  bindEmitter(emitter: EventEmitter): void;
  createContext(): any;
  enter(context: any): void;
  exit(context: any): void;
}

const NAMESPACE_NAME = '__ictx__';
export const namespace = getNamespace(NAMESPACE_NAME) || createNamespace(NAMESPACE_NAME);
