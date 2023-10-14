import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Url } from '../mongodb/entities/index';
import { EncodeDto, EncodeReturnDto, DecodeDto, DecodeReturnDto } from './dto';

@Injectable()
export class UrlManagerService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(Url.name) private readonly urlModel: Model<Url>,
  ) {}

  /**
   * This method encodes a url and saves it in the database with a counter
   * @param url the data transfer object wich contains the url to be encoded
   * @returns the data transfer object wich contains the encoded url
   */
  async encode(url: EncodeDto): Promise<EncodeReturnDto> {
    // MongoDB does not have an auto-increment feature, so we have to do it manually
    // There are more efficient and secure ways to do this, but for the sake of simplicity and time,
    // I will do it this way
    const biggestCounter = await this.urlModel.findOne().sort('-counter');
    const shortenedUrl = await this.urlModel.create({
      url: url.url,
      counter: (biggestCounter?.counter ?? 0) + 1,
    });
    return {
      shortUrl: `${this.config.get('BASE_URL')}/${shortenedUrl.counter}`,
    };
  }

  /**
   * This method decodes a shortened url
   * @param dto the data transfer object wich contains the url to be decoded
   * @returns the data transfer object wich contains the decoded url
   */
  async decode(dto: DecodeDto): Promise<DecodeReturnDto> {
    if (dto.url.includes(this.config.get('BASE_URL'))) {
      const url = await this.urlModel.findOne({
        counter: dto.url.split('/').pop(),
      });
      if (url) {
        return {
          url: url.url,
        };
      } else {
        throw new BadRequestException('Invalid URL');
      }
    }
    throw new BadRequestException('Invalid URL');
  }
}
