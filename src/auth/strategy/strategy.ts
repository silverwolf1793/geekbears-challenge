import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../mongodb/entities';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  /**
   * This method validates the user that is trying to log in
   * @param payload the payload of the JWT token
   * @returns the user details
   */
  async validate(payload: { sub: number; email: string }) {
    const user = await this.userModel.findOne({ email: payload.email });
    delete user.hash;
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName ? user.firstName : null,
      lastName: user.lastName ? user.lastName : null,
    };
  }
}
