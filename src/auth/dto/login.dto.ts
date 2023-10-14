import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LogInDto {
  /**
   * The email of the user
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * The password of the user
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LogInReturnDto {
  /**
   * The first name of the user
   */
  @IsOptional()
  @IsString()
  firstName: string;
  /**
   * The last name of the user
   */
  @IsOptional()
  @IsString()
  lastName: string;
  /**
   * The access token for the user
   */
  @IsNotEmpty()
  @IsString()
  access_token: string;
}
