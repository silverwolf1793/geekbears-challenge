import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guard';
import { EncodeDto, EncodeReturnDto, DecodeDto, DecodeReturnDto } from './dto';
import { UrlManagerService } from './url-manager.service';
import { ErrorDto } from '../auth/dto';

@ApiBearerAuth()
@ApiTags('Url Manager')
@UseGuards(JwtGuard)
@Controller()
export class UrlManagerController {
  constructor(private readonly urlManagerService: UrlManagerService) {}

  @Post('encode')
  @ApiCreatedResponse({
    description: `Return the encoded url, to change the base url modify the .env file,
    note that this could had hidden more the way the url is encoded since this is not very secure, 
    but for the sake of time I kept it simple`,
    type: EncodeReturnDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'The url is invalid',
    type: ErrorDto,
  })
  async encode(@Body() dto: EncodeDto): Promise<EncodeReturnDto> {
    return this.urlManagerService.encode(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Return the decoded url',
    type: DecodeReturnDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'The url is invalid',
    type: ErrorDto,
  })
  @Post('decode')
  async decode(@Body() dto: DecodeDto): Promise<DecodeReturnDto> {
    return await this.urlManagerService.decode(dto);
  }
}
