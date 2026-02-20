// import { Controller, Get, Patch, Param, Body, Delete, UseGuards } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { RolesGuard } from './roles.guard';
// import { AuthGuard } from '../auth/auth.guard';
// import { Roles } from '../auth/roles.decorator';
// import { IsEnum } from 'class-validator';
// import { UserRole } from '@prisma/client';
// import { ValidationPipe, UsePipes } from '@nestjs/common';

// class UpdateUserRoleDto {
//     @IsEnum(UserRole)
//     role: UserRole;
//   }


// @Controller('users')
// @UseGuards(AuthGuard, RolesGuard)
// @Roles(UserRole.ADMIN) 
// export class UsersController {
//     constructor(private usersService: UsersService) {}

//     @Get()
//     async getUsers() {
//         return this.usersService.getAllUsers();
//     }

//     @Patch(':id/role')
//     @UsePipes(new ValidationPipe({ whitelist: true }))
//     async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
//         return this.usersService.updateUserRole(+id, dto.role);
//     }

//     @Delete(':id')
//     deleteUser(@Param('id') id: string) {
//         return this.usersService.deleteUser(+id);
// }
// }

