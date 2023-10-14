import { IsUrl } from 'class-validator';

export class DecodeDto {
  /**
   * The shortened url that will be decoded
   */
  @IsUrl()
  url: string;
}

export class DecodeReturnDto {
  /**
   * The decoded url
   */
  @IsUrl()
  url: string;
}
