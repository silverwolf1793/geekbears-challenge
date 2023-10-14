import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbService } from './mongodb/mongodb.service';
import { MongodbModule } from './mongodb/mongodb.module';
import { UrlManagerModule } from './url-manager/url-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    AuthModule,
    MongodbModule,
    UrlManagerModule,
  ],
  providers: [MongodbService],
})
export class AppModule {}
