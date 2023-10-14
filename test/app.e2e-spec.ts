import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import * as argon from 'argon2';
import { faker } from '@faker-js/faker';

import { AppModule } from '../src/app.module';
import { MongodbService } from '../src/mongodb/mongodb.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongoService: MongodbService;

  // Initialize and set up the NestJS application
  beforeAll(async () => {
    // Create a NestJS testing module
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // Import the AppModule
    }).compile();

    // Create the Nest application instance
    app = moduleRef.createNestApplication({});

    // Apply a global validation pipe with whitelist mode
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    // Initialize the Nest application
    await app.init();

    // Start the application on port 3300
    await app.listen(3300);

    // Get the MongoDB service from the application
    mongoService = app.get(MongodbService);

    // Clean the MongoDB test database
    mongoService.cleanDB();

    // Set the base URL for Pactum requests
    pactum.request.setBaseUrl('http://localhost:3300');
  });

  afterAll(async () => {
    // We clean the test database and close the app
    await mongoService.cleanDB();
    await app.close();
  });

  afterEach(async () => {
    // We clean the test database after each test
    await mongoService.cleanDB();
  });

  describe('auth-module', () => {
    describe('POST /signup', () => {
      const url = '/signup';
      it('should return 201 and the newly created user', () => {
        // Generate random user data using Faker
        const data = {
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        };

        // Create a Pactum specification for a POST request to the specified URL
        return pactum
          .spec()
          .post(url)
          .withBody({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
          })
          .expectStatus(HttpStatus.CREATED)
          .expectJsonLike({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          })
          .expectBodyContains('access_token'); // Expect the response body to contain an 'access_token'
      });
      it('should return 201 and the newly created user even if optional elements are missing', async () => {
        // Generate random user data using Faker
        const data = {
          email: faker.internet.email(),
          password: faker.internet.password(),
        };
        // Create a Pactum specification for a POST request to the specified URL
        return await pactum
          .spec()
          .post(url)
          .withBody({
            email: data.email,
            password: data.password,
          })
          .expectStatus(HttpStatus.CREATED)
          .expectJsonLike({
            email: data.email,
            firstName: null,
            lastName: null,
          })
          .expectBodyContains('access_token');
      });
      it('should return 400 if email is missing', () => {
        return pactum
          .spec()
          .post(url)
          .withBody({
            password: faker.internet.password(),
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should return 400 if password is missing', () => {
        return pactum
          .spec()
          .post(url)
          .withBody({
            email: faker.internet.email(),
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should create a new user to the db and have a valid hashed password', async () => {
        // Generate random user data using Faker
        const data = {
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        };

        // Make a POST request to the specified URL with the generated user data
        await pactum
          .spec()
          .post(url)
          .withBody({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
          })
          .expectStatus(HttpStatus.CREATED);

        // Get the database connection from the MongoDB service
        const dbConnection = mongoService.getConnection();

        // Find the user in the 'users' collection with the generated email
        const user = await dbConnection
          .collection('users')
          .findOne({ email: data.email });

        // Ensure that the user is defined and matches the generated data
        expect(user).toBeDefined();
        expect(user).toMatchObject({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        });

        // Ensure the user has '_id' and 'hash' properties
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('hash');

        // Verify the user's password using Argon2
        const isPasswordValid = await argon.verify(user.hash, data.password);

        // Expect the password verification to be true
        expect(isPasswordValid).toBe(true);
      });
      it('should return 409 if the user already exists', async () => {
        // Generate random user data using Faker
        const email = faker.internet.email();

        // Make a POST request to the specified URL with the generated  email
        await pactum
          .spec()
          .post(url)
          .withBody({
            email: email,
            password: faker.internet.password(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          })
          .expectStatus(HttpStatus.CREATED);

        // Make a POST request to the specified URL with the same email
        return await pactum
          .spec()
          .post(url)
          .withBody({
            email: email,
            password: faker.internet.password(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          })
          .expectStatus(HttpStatus.CONFLICT);
      });
    });
    describe('POST /login', () => {
      // Generate random user data using Faker
      const data = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const url = '/login';

      beforeEach(async () => {
        // Create a user in the database to be able to login since the db is cleaned after each test
        await pactum
          .spec()
          .post('/signup')
          .withBody({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
          })
          .expectStatus(HttpStatus.CREATED);
      });

      it('should return 200 and the user', async () => {
        // Make a POST request to the specified URL with the generated user data
        return await pactum
          .spec()
          .post(url)
          .withBody({
            email: data.email,
            password: data.password,
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonLike({
            firstName: data.firstName,
            lastName: data.lastName,
          })
          .expectBodyContains('access_token');
      });
      it('should throw 403 if user does not exist', async () => {
        // Make a POST request to the specified URL with the generated user data
        return await pactum
          .spec()
          .post(url)
          .withBody({
            email: faker.internet.email(),
            password: faker.internet.password(),
          })
          .expectStatus(HttpStatus.FORBIDDEN);
      });
      it('should throw 403 if password is incorrect', async () => {
        // Make a POST request to the specified URL with the generated user data
        return await pactum
          .spec()
          .post(url)
          .withBody({
            email: data.email,
            password: faker.internet.password(),
          })
          .expectStatus(HttpStatus.FORBIDDEN);
      });
    });
    describe('GET /extra-mile/me', () => {
      const url = '/extra-mile/me';
      // Generate random user data using Faker
      const data = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      // This variable will hold the JWT token for authentication on the tests
      let jwt = '';

      beforeEach(async () => {
        // Create a user in the database to be able to login since the db is cleaned after each test
        const response = await pactum
          .spec()
          .post('/signup')
          .withBody({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
          })
          .expectStatus(HttpStatus.CREATED);
        jwt = response.body.access_token;
      });

      it('should return 401 if no token is provided', async () => {
        return await pactum
          .spec()
          .get(url)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('should return 200 and the user', async () => {
        return await pactum
          .spec()
          .get(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonMatch({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
      });
    });
  });

  describe('url-manager-module', () => {
    describe('POST /encode', () => {
      const url = '/encode';
      // Generate random user data using Faker
      const data = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      // This variable will hold the JWT token for authentication on the tests
      let jwt = '';

      beforeEach(async () => {
        // Create a user in the database to be able to login since the db is cleaned after each test
        const response = await pactum
          .spec()
          .post('/signup')
          .withBody({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
          })
          .expectStatus(HttpStatus.CREATED);
        jwt = response.body.access_token;
      });

      it('should return 401 if no token is provided', async () => {
        return await pactum
          .spec()
          .withBody({
            url: faker.internet.url(),
          })
          .post(url)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should return 400 if no url is provided', async () => {
        return await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 if url is not valid', async () => {
        return await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withBody({
            url: 'not a url',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should return 201 and the shortened url, the code should autoincrement', async () => {
        // Perform a POST request to the specified URL with JWT authorization
        let response = await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withBody({
            url: faker.internet.url(),
          })
          .expectStatus(HttpStatus.CREATED);

        // Extract the shortened URL from the response body
        let shortenedUrl = response.body.shortUrl;

        // Ensure the shortened URL contains the base URL from environment variables
        expect(shortenedUrl).toContain(process.env.BASE_URL);

        // Split the shortened URL by '/' to get the last element
        let splitUrl = shortenedUrl.split('/');
        let lastElement = splitUrl[splitUrl.length - 1];

        // Expect the last element to be equal to 1 (assuming it's a number)
        expect(Number(lastElement)).toEqual(1);

        // Perform the same set of operations for a second request with an expectation of 2
        // since the code should autoincrement
        response = await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withBody({
            url: faker.internet.url(),
          })
          .expectStatus(HttpStatus.CREATED);

        shortenedUrl = response.body.shortUrl;
        expect(shortenedUrl).toContain(process.env.BASE_URL);

        splitUrl = shortenedUrl.split('/');
        lastElement = splitUrl[splitUrl.length - 1];
        expect(Number(lastElement)).toEqual(2);
      });
    });
    describe('GET /decode', () => {
      const url = '/decode';
      // Generate random user data using Faker
      const data = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      // This variable will hold the JWT token for authentication on the tests
      let jwt = '';
      beforeEach(async () => {
        // Create a user in the database to be able to login since the db is cleaned after each test
        const response = await pactum
          .spec()
          .post('/signup')
          .withBody({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
          })
          .expectStatus(201);
        jwt = response.body.access_token;
      });

      it('should return 401 if no token is provided', async () => {
        return await pactum
          .spec()
          .post(url)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('should return 400 if no url is provided', async () => {
        return await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should return 400 if url is not valid', async () => {
        return await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withPathParams({
            url: 'not a url',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should return 400 if the url is not shortened', async () => {
        return await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withBody({
            url: faker.internet.url(),
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should return 400 if the url is shortened but not in the db', async () => {
        return await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withBody({
            url: `${process.env.BASE_URL}/999`,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should return the original url', async () => {
        // Generate a random original URL using Faker
        const originalUrl = faker.internet.url();

        // Shorten the original URL and expect a 201 status code
        const response = await pactum
          .spec()
          .post('/encode')
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withBody({
            url: originalUrl,
          })
          .expectStatus(HttpStatus.CREATED);

        // Extract the shortened URL from the response
        const shortenedUrl = response.body.shortUrl;

        // Make a request using the shortened URL and expect a 200 status code
        // Also, expect the response body to contain the original URL
        return await pactum
          .spec()
          .post(url)
          .withHeaders({
            Authorization: `Bearer ${jwt}`,
          })
          .withBody({
            url: shortenedUrl,
          })
          .expectStatus(HttpStatus.OK)
          .expectBody({
            url: originalUrl,
          });
      });
    });
  });
});
