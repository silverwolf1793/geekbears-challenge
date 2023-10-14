import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

import {
  SignUpDto,
  SignUpReturnDto,
  LogInDto,
  LogInReturnDto,
  UserDto,
} from './dto/index';
import { User } from '../mongodb/entities/index';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  /**
   * We use argon2 to hash the password, and then we save the user in the database
   * Then we return a DTO with the user details and an access token, note that
   * the access token secret and expiration time are defined in the .env file
   * @param dto The data transfer object wich contains the user data
   * @returns The data transfer object wich contains the user data and an access token
   */
  async signup(dto: SignUpDto): Promise<SignUpReturnDto> {
    // Check if a user with the provided email already exists
    const alreadyRegisteredUser = await this.userModel.findOne({
      email: dto.email,
    });

    // If a user with the same email is found, throw a ConflictException
    if (alreadyRegisteredUser) {
      throw new ConflictException('User already exists');
    }

    // Create a new user with the provided DTO data
    const user = await this.userModel.create({
      email: dto.email,
      hash: await argon.hash(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // Return a DTO with user details and an access token
    return {
      email: user.email,
      firstName: user.firstName ? user.firstName : null,
      lastName: user.lastName ? user.lastName : null,
      access_token: await this.jwt.signAsync(
        {
          email: user.email,
          sub: user._id,
        },
        {
          expiresIn: this.config.get('JWT_EXPIRATION_TIME'),
          secret: this.config.get('JWT_SECRET'),
        },
      ),
    };
  }

  /**
   * This method checks if the user exists, and if it does, it returns a DTO with the user details and an access token
   * @param dto The data transfer object wich contains the user data
   * @returns The data transfer object wich contains the user data and an access token
   */
  async login(dto: LogInDto): Promise<LogInReturnDto> {
    // Find a user by their email
    const user = await this.userModel.findOne({ email: dto.email });

    // If the user is not found, throw a ForbiddenException
    if (!user) {
      throw new ForbiddenException('User or password incorrect');
    }

    // Check if the provided password is correct
    const isPasswordCorrect = await argon.verify(user.hash, dto.password);
    if (!isPasswordCorrect) {
      throw new ForbiddenException('User or password incorrect');
    }

    // Return a DTO with user details and an access token
    return {
      firstName: user.firstName ? user.firstName : null,
      lastName: user.lastName ? user.lastName : null,
      access_token: await this.jwt.signAsync(
        {
          email: user.email,
          sub: user._id,
        },
        {
          expiresIn: this.config.get('JWT_EXPIRATION_TIME'),
          secret: this.config.get('JWT_SECRET'),
        },
      ),
    };
  }

  /**
   * This method returns the user details
   * @param user The user details
   * @returns The user details
   */
  async me(user: UserDto): Promise<UserDto> {
    return user;
  }
}
