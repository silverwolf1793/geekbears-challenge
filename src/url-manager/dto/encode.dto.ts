import { IsNotEmpty, IsUrl } from 'class-validator';

export class EncodeDto {
  /**
   * The url that will be shortened
   */
  @IsUrl()
  @IsNotEmpty()
  url: string;
}

export class EncodeReturnDto {
  /**
   * The shortened url
   */
  @IsUrl()
  shortUrl: string;
}
