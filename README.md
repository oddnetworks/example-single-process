# Oddworks Example Server - Single Process

[![slack.oddnetworks.com](http://slack.oddnetworks.com/badge.svg)](http://slack.oddnetworks.com)

This is a quick example of an Oddworks server with all services, stores, and the API running in a single process.

This is only an example and should not be used in production. You would likely want to split out some of this functionality into separate processes.

## Deploy It!

You can install this to Heroku as-is to get a quick reference API.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

		Note: Auto-deploying on Heroku will generate the JWT_SECRET environment variable.

## Setup

After you've cloned this repo locally, follow these steps to get it running.

### Install node modules

		$ npm install

### Start

Locally you can use the following command to start the server:

		$ npm run dev

## Hit the API

Once your server is running, you can begin making requests like so:

		$ curl -X GET -H "x-access-token: YOUR_TOKEN_HERE" -H "Accept: application/json" "http://localhost:3000/videos"

__Required Headers__

- `x-access-token` - the value here will depend on how you deployed and your environment. See [Access Tokens](#access-tokens)
- `accept` - the value here should always be `application/json`

### Access Tokens

The default data includes one channel named `nasa` and three platforms with ids of `apple-ios`, `apple-tv`, and `roku`. In order to generate an access token for the sample data, you can use the [oddworks-cli](https://www.npmjs.com/package/@oddnetworks/oddworks-cli) like so:

		$ oddworks generate-token -c nasa -p apple-ios -j {your-jwt-secret}

If you did not explicitly set the `JWT_SECRET` environment varaible, it will default to the value `secret`. If you deployed using the Heroku auto-deploy, this environment variable was auto-generated for you and can be found by running the following:

		$ heroku config -a your-heroku-app-name | grep JWT_SECRET

## Environment

There are a few environment variables that the configuration file `./config.js` uses to set up the server.

- `PORT` - the port you would like to run the server on. The default value is `3000`
- `JWT_SECRET` - the secret hash used for generating any JWT tokens needed to access your server's API. The default value is `secret`.
- `DATA_DIR` - the directory that will be used to seed data. [See below](#example-data)
- `NODE_ENV` - defaults to `development`

You may leave these values as-is.

## Example Data


		$ curl -X GET -H "x-access-token: YOUR_TOKEN_HERE" -H "Accept: application/json" "http://localhost:3000/videos"
By default we use the `nasa` seed function provided by the [@oddnetworks/oddworks-example-data](
### Access Tokens
https://www.npmjs.com/package/@oddnetworks/oddworks-example-data) package.
The default data includes one channel named `nasa` and three platforms with ids of `apple-ios`, `apple-tv`, and `roku`. In order to generate an access token for the sample data, you can use the [oddworks-cli](https://www.npmjs.com/package/@oddnetworks/oddworks-cli) like so:

		$ oddworks generate-token -c nasa -p apple-ios -j {your-jwt-secret}

If you did not explicitly set the `JWT_SECRET` environment varaible, it will default to the value `secret`. If you deployed using the Heroku auto-deploy, this environment variable was auto-generated for you and can be found by running the following:

		$ heroku config -a your-heroku-app-name | grep JWT_SECRET



__You do not need to override example data, but if you want to:__

The configuration file relies on example data and a seed script to get running. For examples of how to set this up yourself, and override the seed script using the `DATA_DIR` environment variable, please check out the [oddworks-example-data](https://github.com/oddnetworks/oddworks-example-data) repo.

You can clone the `oddworks-example-data` repo, or if you want to start working with the seed script within this project you can use the [oddworks-cli](https://www.npmjs.com/package/@oddnetworks/oddworks-cli) and run:

		$ oddworks fetch-data
