import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongodbService {
  constructor(@InjectConnection() private connection: Connection) {}

  /**
   * This method cleans the database, useful for testing
   * @returns a boolean indicating if the database was cleaned
   */
  cleanDB = async (): Promise<boolean> =>
    await this.connection.db.dropDatabase();

  /**
   *
   * @returns the connection to the database, useful for testing
   */
  getConnection = (): Connection => this.connection;
}
