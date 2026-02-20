// // import { Module } from '@nestjs/common';
// // import { UsersController } from './users.controller';
// // import { UsersService } from './users.service';
// // import { PrismaService } from '../prisma/prisma.service';
// // import { JwtModule } from '@nestjs/jwt'; // ✅ import JwtModule
// // import { RolesGuard } from './roles.guard';

// // @Module({
// //   imports: [
// //     JwtModule.register({ // or JwtModule.registerAsync(...) depending on your setup
// //       secret: process.env.JWT_SECRET,
// //       signOptions: { expiresIn: '1h' },
// //     }),
// //   ],
// //   controllers: [UsersController],
// //   providers: [UsersService, PrismaService, RolesGuard],
// // })
// // export class UsersModule {}

// import { Module } from '@nestjs/common';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { PrismaModule } from '../prisma/prisma.module';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Module({
//   imports: [
//     PrismaModule,
//     // AuthGuard uses JwtService so we need JwtModule here too
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//         signOptions: { expiresIn: '1d' },
//       }),
//     }),
//   ],
//   controllers: [UsersController],
//   providers: [UsersService],
//   exports: [UsersService],
// })
// export class UsersModule {}
