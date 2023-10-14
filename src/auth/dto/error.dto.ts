import { IsNumber, IsString } from 'class-validator';

export class ErrorDto {
  /**
   * The message of the error
   * */
  @IsString()
  message: string[];
  /**
   * The status code of the error
   * */
  @IsNumber()
  statusCode: string;
  /**
   * The error
   * */
  @IsString()
  error: string;
}
