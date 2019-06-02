import { EventEmitter } from 'events';

import { createNamespace, getNamespace } from 'cls-hooked';

interface Namespace {
  active: any;

  set<T>(key: string, value: T): T;
  get(key: string): any;
  run(fn: (...args: any[]) => void): void;
  runAndReturn<T>(fn: (...args: any[]) => T): T;
  runPromise<T>(fn: (...args: any[]) => Promise<T>): Promise<T>;
  bind<F extends Function>(fn: F, context?: any): F; // tslint:disable-line: ban-types
  bindEmitter(emitter: EventEmitter): void;
  createContext(): any;
  enter(context: any): void;
  exit(context: any): void;
}

const NAMESPACE_NAME = '__ctx__';
export const namespace = getNamespace(NAMESPACE_NAME) || createNamespace(NAMESPACE_NAME);
