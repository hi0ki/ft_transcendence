import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/*@Get('delete-user/:id')
@UseGuards(AuthGuard('jwt')) // authentication
async deleteUser(@Req() req, @Param('id') id: number) {
  if (req.user.role !== 'ADMIN') {
    return { message: 'Access denied: Only admins can delete users' };
  }

  // now do the deletion
  await this.prisma.user.delete({ where: { id } });
  return { message: 'User deleted successfully' };
}
*/