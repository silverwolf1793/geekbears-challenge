import {
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignUpDto, SignUpReturnDto } from './dto/signup.dto';
import { ErrorDto, LogInDto, LogInReturnDto, UserDto } from './dto';
import { GetUser } from './decorator';
import { JwtGuard } from './guard';

@ApiTags(
  'Athentication: note we are returning the user info in the jwt token to show that its hitting the database',
)
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  @ApiCreatedResponse({
    description:
      'The user has been successfully created, note that we are returning the user info in the jwt token to show that its hitting the database',
    type: SignUpReturnDto,
  })
  @ApiConflictResponse({
    description: 'The user already exists',
    type: ErrorDto,
  })
  async signup(@Body() dto: SignUpDto): Promise<SignUpReturnDto> {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Login successfull, note that we are returning the user info in the jwt token to show that its hitting the database',
    type: LogInReturnDto,
  })
  @Post('login')
  login(@Body() dto: LogInDto): Promise<LogInReturnDto> {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: `Return the owner of the jwt token info, note that we are returning the user info from the jwt token to show that 
    we are using passport to verify the jwt token by hitting the database, also note that we are using the custom GetUser decorator to get 
    the user info from the request object, also this should have been its own CRUD users module, but for the sake of simplicity and time, 
    I am adding it here`,
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'The jwt token is invalid',
    type: ErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorDto,
  })
  @UseGuards(JwtGuard)
  // this should have been its own CRUD users module, but for the sake of simplicity and time, I am adding it here
  @Get('extra-mile/me')
  me(@GetUser() user: UserDto): Promise<UserDto> {
    return this.authService.me(user);
  }
}
