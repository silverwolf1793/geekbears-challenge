import { IsOptional, IsString } from 'class-validator';

export class UserDto {
  /**
   * The id of the user
   */
  @IsString()
  id: string;
  /**
   * The first name of the user
   */
  @IsString()
  @IsOptional()
  firstName: string;
  /**
   * The last name of the user
   */
  @IsString()
  @IsOptional()
  lastName: string;
  /**
   * The email of the user
   */
  @IsString()
  email: string;
}
