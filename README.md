# Oddworks Example Server - Single Process

[![slack.oddnetworks.com](http://slack.oddnetworks.com/badge.svg)](http://slack.oddnetworks.com)

This is a quick example of an Oddworks server with all services, stores, and the API running in a single process.

This is only an example and should not be used in production. You would likely want to do things differently.

This setup uses the following oddworks stores and services:

- __[redis store](https://github.com/oddnetworks/oddworks/tree/master/lib/stores/redis)__
- __[redis-search store](https://github.com/oddnetworks/oddworks/tree/master/lib/stores/redis-search)__
- __[catalog service](https://github.com/oddnetworks/oddworks/blob/master/lib/services/catalog)__
- __[events service](https://github.com/oddnetworks/oddworks/blob/master/lib/services/events)__ - with the __[google-analytics analyzer](https://github.com/oddnetworks/oddworks/tree/master/lib/services/events/analyzers)__
- __[identity service](https://github.com/oddnetworks/oddworks/tree/master/lib/services/identity)__
- __[json-api service](https://github.com/oddnetworks/oddworks/tree/master/lib/services/json-api)__

_*Note_: We're using [fakeredis](https://www.npmjs.com/package/fakeredis) and make no guarantees about your data here. You would probably not want to use this in production.

## Deploy It!

You can install this to Heroku as-is to get a quick reference API.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

		Note: Auto-deploying on Heroku will generate the JWT_SECRET environment variable.

## Setup

After you've cloned this repo locally, follow these steps to get it running.

### Install node modules

		$ npm install

We use [foreman](https://www.npmjs.com/package/foreman) to manage multiple node processes via the `./Procfile`.

		$ npm install -g foreman


### Environment Variables

You will need the following environment variables before running this example

- `NODE_ENV` - this environment variable will tell which environment to run node in. The default value is `development`.
- `PORT` - this environment variable will tell which port to run the [express](https://www.npmjs.com/package/express) server on. The default value is `3000`.
- `JWT_SECRET` - this environment variable is used as the secret used to sign your [JWT tokens](https://jwt.io/). The default value is `secret`.
- `DATA_DIR` - this environment variable will tell our server where to look for a `seed.js` file. By default this is `undefined` and we use `@oddnetworks/oddworks-example-data`'s `nasa` seed script. Read below about [Example Data](#example-data)
- `GOOGLE_ANALYTICS_ID` - this environment variable is used to send event metrics into the __google-analytics event analyzer__. The default value is `UA-XXXX-XX`.

You can override the default values, or run the server as-is.

### Startup

Locally you can use the following command to start the server:

		npm run dev

We use [nodemon](https://www.npmjs.com/package/nodemon) for development to automatically reload the server for us when file changes are detected.

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

## Example Data

By default we use the `nasa` seed function provided by the [@oddnetworks/oddworks-example-data](https://www.npmjs.com/package/@oddnetworks/oddworks-example-data) package.

__You do not need to override example data, but if you want to:__

The configuration file relies on example data and a seed script to get running. For examples of how to set this up yourself, and override the seed script using the `DATA_DIR` environment variable, please check out the [oddworks-example-data](https://github.com/oddnetworks/oddworks-example-data) repo.

You can clone the `oddworks-example-data` repo, or if you want to start working with the seed script within this project you can use the [oddworks-cli](https://www.npmjs.com/package/@oddnetworks/oddworks-cli) and run:

		$ oddworks fetch-data
