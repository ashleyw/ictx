import { createNamespace, getNamespace } from 'cls-hooked';

const NAMESPACE_NAME = '__ctx__';
export const namespace = getNamespace(NAMESPACE_NAME) || createNamespace(NAMESPACE_NAME);
