// import { SetMetadata } from '@nestjs/common';
// //Metadata is just hidden data we can later read (for example, in a guard).
// import { UserRole } from '@prisma/client';
// //SetMetadata is a NestJS function that attaches metadata to a class or method.

// export const Roles = (...roles: UserRole[]) => {
//   return SetMetadata('roles', roles);
// };
// export const Roles = (...roles: string[]) => SetMetadata('roles', roles);


// import { SetMetadata } from '@nestjs/common';
// import { UserRole } from '@prisma/client';

// export const ROLES_KEY = 'roles';

// export const Roles = (...roles: UserRole[]) =>
//   SetMetadata(ROLES_KEY, roles);



import { SetMetadata } from '@nestjs/common';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  // MODERATOR = 'MODERATOR',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
