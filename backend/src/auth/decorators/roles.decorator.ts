import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type Role = 'ADMIN' | 'PORTAL' | 'INTERNAL';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
