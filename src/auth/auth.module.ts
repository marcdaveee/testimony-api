import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { configSettings } from 'src/config/config.settings';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: configSettings.jwtSettings.secretKey,
      signOptions: {
        expiresIn: '5min',
      },
    }),

    PrismaModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
