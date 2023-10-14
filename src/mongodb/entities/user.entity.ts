import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  /**
   * The email of the user, it has to be unique since it will be used as the id
   * */
  @Prop({
    unique: true,
    index: true,
  })
  email: string;

  /**
   * The hash of the password
   */
  @Prop({})
  hash: string;

  /**
   * The first name of the user
   */
  @Prop({})
  firstName: string;

  /**
   * The last name of the user
   */
  @Prop({})
  lastName: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
