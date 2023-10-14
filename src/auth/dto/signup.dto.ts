import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpDto {
  /**
   * The email of the user
   * */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * The password of the user
   */
  @IsNotEmpty()
  @IsString()
  password: string;

  /**
   * The first name of the user
   * */
  @IsString()
  @IsOptional()
  firstName: string;

  /**
   * The last name of the user
   * */
  @IsString()
  @IsOptional()
  lastName: string;
}

export class SignUpReturnDto {
  /**
   * The email of the user
   * */
  @IsEmail()
  email: string;
  /**
   * The first name of the user
   * */
  @IsString()
  @IsOptional()
  firstName: string;
  /**
   * The last name of the user
   * */
  @IsString()
  @IsOptional()
  lastName: string;
  /**
   * The access token for the user
   * */
  @IsNotEmpty()
  @IsString()
  access_token: string;
}
