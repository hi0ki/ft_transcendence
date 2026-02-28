import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Req, HttpCode, HttpStatus, ParseIntPipe} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, Role } from '../decorators/roles.decorator';


@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }


  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.findOne(req.user.id);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.findOne(id);
  }


  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Req() req: any)
  {
    return this.usersService.update(id, dto, req.user);
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