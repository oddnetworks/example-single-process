# Oddworks Example Server - Single Process

This is a quick example of an Oddworks server with all services, stores, and the API running in a single process.

This is only an example and should not be used in production. You would likely want to split out some of this functionality into separate processes.

## Deploy It!

You can install this to Heroku as-is to get a quick reference API.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Setup

After you've cloned this repo locally, follow these steps to get it running.

### Install node modules

```
> npm install
```

### Start

Locally you can use the following command to start the server:

```
> npm run dev
```

### Environment

There are a few environment variables that the configuration file `./config.js` uses to set up the server.

- `PORT` - the port you would like to run the server on. The default value is `3000`
- `JWT_SECRET` - the secret hash used for generating any JWT tokens needed to access your server's API. The default value is `secret`.
- `DATA_DIR` - the directory that will be used to seed data. [See below](#example-data)
- `NODE_ENV` - defaults to `development`

You may leave these values as-is.

### Example Data

By default we use the `nasa` seed function provided by the [@oddnetworks/oddworks-example-data](https://www.npmjs.com/package/@oddnetworks/oddworks-example-data) package.

__You do not need to override this, but if you want to:__

The configuration file relies on example data and a seed script to get running. For examples of how to set this up yourself, and override the seed script using the `DATA_DIR` environment variable, please check out the [oddworks-example-data](https://github.com/oddnetworks/oddworks-example-data) repo. There you will find a [README for the nasa example data](https://github.com/oddnetworks/oddworks-example-data/tree/master/nasa).

You can clone the `oddworks-example-data` repo, or if you want to start working with the seed script within this project you can use the [oddworks-cli](https://www.npmjs.com/package/@oddnetworks/oddworks-cli) and run `oddworks fetch-data`.
