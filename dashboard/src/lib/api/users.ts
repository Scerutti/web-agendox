import { serverFetch } from './server';
import type { UserView } from './users.types';

export type { UserView } from './users.types';
export { userDisplayName } from './users.types';

export const getUsers = () => serverFetch<UserView[]>('/users');
