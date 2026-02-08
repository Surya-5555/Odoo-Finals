import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info?: any) {
    if (err) {
      throw err;
    }

    if (!user) {
      // Keep it generic for production safety, but more helpful than the default "Unauthorized".
      const message =
        info?.name === 'TokenExpiredError'
          ? 'Access token expired'
          : 'Missing or invalid access token';
      throw new UnauthorizedException(message);
    }

    return user;
  }
}
