import { Module } from '@nestjs/common';
import { UrlManagerController } from './url-manager.controller';
import { UrlManagerService } from './url-manager.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from '../mongodb/entities';

@Module({
  controllers: [UrlManagerController],
  providers: [UrlManagerService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Url.name,
        schema: UrlSchema,
      },
    ]),
  ],
})
export class UrlManagerModule {}
