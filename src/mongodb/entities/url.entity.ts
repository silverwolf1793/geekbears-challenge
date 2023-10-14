import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Url extends Document {
  /**
   * The original url that was shortened
   */
  @Prop({})
  url: string;

  /**
   * The counter that will be used to generate the shortened url
   */
  @Prop({
    unique: true,
  })
  counter: number;
}
export const UrlSchema = SchemaFactory.createForClass(Url);
