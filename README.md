# Oddworks Example Server - Single Process

This is a quick example of an Oddworks server with all services, stores, and the API running in a single process.

This is only an example and should not be used in production. You would likely want to split out some of this functionality into separate processes.

## Setup

### Install node modules

```
> npm install
```

### Environment

There are a few environment variables that the configuration file `./config.js` uses to set up the server.

- `PORT` - the port you would like to run the server on. The default value is `3000`
- `JWT_SECRET` - the secret hash used for generating any JWT tokens needed to access your server's API. The default value is `secret`.
- `DATA_DIR` - the directory that will be used to seed data. [See below](#example-data)
- `NODE_ENV` - defaults to `development`

You may leave these values as-is.

### Start

Locally you can use the following command to start the server:

```
> npm run dev
```

### Heroku

You can install this to Heroku as-is to get a quick reference API.


### Example Data

By default we use the `nasa` seed function provided by the [@oddnetworks/oddworks-example-data](https://www.npmjs.com/package/@oddnetworks/oddworks-example-data) package.

__You do not need to override this, but if you want to:__

The configuration file relies on example data and a seed script to get running. For examples of how to set this up yourself, and override the seed script using the `DATA_DIR` environment variable, please check out the [oddworks-example-data](https://github.com/oddnetworks/oddworks-example-data) repo.
