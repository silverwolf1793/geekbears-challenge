<p align="center">
  <a href="https://www.geekbears.com/" target="blank"><img src="https://miro.medium.com/v2/resize:fit:1024/0*AN9__N1EZBgkPqC9.jpg" width="200" alt="Geekbears Logo" /></a>
</p>

## Description

The [Geekbears](https://www.geekbears.com/) code-challenge for backend developers using Nest

## Installation

```bash
# Install the dependencies
$ npm install
# IMPORTANT: Open your docker app on the background
# Launches the dev docker database container and the test docker database container
$ npm run db:generate
# IMPORTANT: Wait for the databases to be fully deployed
# we run the tests to check that everything is working, if you got errors most likely you got issues with docker or the databases have not being deployed yet
$ npm run test:e2e
# finally we run the app
$ npm run start
```

## Running the app

```bash
# Removes the dev docker database, useful to reset the whole thing
$ npm db:dev:rm
# Launches the dev docker database container
$ npm db:dev:up
# Restarts the dev docker database container by removing it and launching it again
$ npm db:dev:restart
# Removes the test docker database, useful to reset the whole thing
$ npm db:test:rm
# Launches the test docker database container
$ npm db:test:up
# Restarts the test docker database container by removing it and launching it again
$ npm db:test:restart
# Launches the dev docker database container and the test docker database container
$ npm db:generate
```

## Test

```bash
# Initiates the end to end tests with the dev docker database container
$ npm run test:e2e

# Initiates the the end to end tests with the dev docker database container and a watchdog that will restart the tests if any file is changed
$ npm run test:e2e:watchdog
```

## Stay in touch

- Author - Ing.  Eric Saúl López Barragán
- Email - ericsaullb@gmail.com
