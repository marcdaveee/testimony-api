import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { configSettings } from 'src/config/config.settings';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = this.jwtService.verifyAsync(token, {
        secret: configSettings.jwtSettings.secretKey,
      });

      // Assign the payload to the request object and access it from the route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  extractTokenFromHeader(request: Request) {
    const [token, val] = request.headers.authorization?.split(' ') || [];

    return token === 'Bearer' ? val : undefined;
  }
}
