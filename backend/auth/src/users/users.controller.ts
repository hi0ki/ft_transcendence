import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Req, HttpCode, HttpStatus, ParseIntPipe} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, Role } from '../decorators/roles.decorator';


@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.findOne(id);
  }
  

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) 
  {
    return this.usersService.remove(id, req.user);
  }


  @Patch(':id/role')
  @Roles(Role.ADMIN)
  changeRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: Role)
  {
    return this.usersService.changeRole(id, role);
  }
}