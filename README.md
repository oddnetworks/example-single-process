# Oddworks Example Server - Single Process

[![slack.oddnetworks.com](http://slack.oddnetworks.com/badge.svg)](http://slack.oddnetworks.com)

This is a quick example of an Oddworks server with all services, stores, and the API running in a single process.

This is only an example and should not be used in production. You would likely want to do things differently.

This setup uses the following oddworks stores and services:

- __[redis store](https://github.com/oddnetworks/oddworks/tree/master/lib/stores/redis)__
- __[redis-search store](https://github.com/oddnetworks/oddworks/tree/master/lib/stores/redis-search)__
- __[catalog service](https://github.com/oddnetworks/oddworks/blob/master/lib/services/catalog)__
- __[identity service](https://github.com/oddnetworks/oddworks/tree/master/lib/services/identity)__
- __[json-api service](https://github.com/oddnetworks/oddworks/tree/master/lib/services/json-api)__

_*Note_: We're using [fakeredis](https://www.npmjs.com/package/fakeredis) and make no guarantees about your data here. You would probably not want to use this in production.

## Deploy It!

You can install this to Heroku as-is to get a quick reference API.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

		Note: Auto-deploying on Heroku will generate the JWT_SECRET environment variable.

----

## Setup

After you've cloned this repo locally, follow these steps to get it running.

### Step One: Install node modules

		$ make install

#### Environment Variables

You can override the default values we use in `example.env`, or run the server as-is.

- `NODE_ENV` - this environment variable will tell which environment to run node in. The default value is `development`.
- `PORT` - this environment variable will tell which port to run the [express](https://www.npmjs.com/package/express) server on. The default value is `3000`.
- `JWT_SECRET` - this environment variable is used as the secret used to sign your [JWT tokens](https://jwt.io/). The default value is `secret`.
- `DATA_DIR` - this environment variable will tell our server where to look for a `seed.js` file. By default this is `undefined` and we use `@oddnetworks/oddworks-example-data`'s `nasa` seed script. Read below about [Example Data](#example-data)

### Step 2: Startup

Locally you can use the following command to start the server:

		make run-dev

We use [nodemon](https://www.npmjs.com/package/nodemon) for development to automatically reload the server for us when file changes are detected.

### Step 3: Generate Your Platform Config Token

1. Copy this json
```json
{
  "channel": "nasa",
  "platform": "web",
  "aud": [
    "platform"
  ],
  "iss": "urn:oddworks"
}
```
2. Head over to [JWT.io](https://jwt.io) and use the above json as the body, and use `secret` as the secret.
3. Use the generated JWT string in step 4.

### Step 4: Hit the `/config` endpoint with your new platform token

Once your server is running, you can begin making requests like so:

		$ curl -X GET -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" "http://localhost:3000/config"

__Required Headers__

- `Authorization` - the value here will depend on how you deployed and your environment. See [Tokens](#tokens)
- `Content-Type` - the value here should always be `application/json`

The returned `JWT` will be your **user token** for all future requests.

----

### Tokens

There are 2 types of tokens used within Oddworks. Using the **Oddworks SDKs** this will be handle the app loading sequence for you, but for for your own knowledge you should understand how tokens are used.

The high level flow is:

**First App Install**

1. Generate **platform token** and submit app to the app store.
2. App is downloaded by a user and opens it.
3. `/config` is hit with a **platform token**.
4. Since the **platform token** does not contain a user, `/config` returns a new user with a new **user token** to use from now on.
5. The app saves the **user token** on the device.
6. Requests to `/collections`, `/videos`, etc. use the new **user token**.

**Repeated Usage**

1. User opens app again days later.
2. Device loads the **user token** from the device.
3. `/config` is hit with a **user token** instead of the **platform token**.
4. `/config` now only returns its normal response and does not create a new user and token.
5. Requests to `/collections`, `/videos`, etc. continue to use the loaded **user token**.

#### Platform Token

```json
{
  "channel": "nasa",
  "platform": "web",
  "aud": [
    "platform"
  ],
  "iss": "urn:oddworks"
}
```

This token contains the **channel** and **platform** and is embedded into the app when you submit it to the app store. This token will only allow the device access to the `/config` endpoint. After hitting the `/config` endpoint with a **platform token** you will get a response that contains an automatically generated new anonymous user. This new user is saved in the user table with a new UUID. You will also get a JWT specifically for that user to use for subsequent API requests.

```json
{
  "data": {
    "id": "nasa-web",
    "type": "config",
    "attributes": {
    	"features": ...,
    	"views": ...,
    	"user": {
			"id": "5e3e073b-8477-4e3f-9061-a543a819cdff",
        	"channel": "nasa",
			"type": "user"
		},
		"jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsIjoibmFzYSIsInBsYXRmb3JtIjoid2ViIiwidXNlciI6IjVlM2UwNzNiLTg0NzctNGUzZi05MDYxLWE1NDNhODE5Y2RmZiIsImlhdCI6MTQ2OTcxOTEwNCwiYXVkIjpbInBsYXRmb3JtIl0sImlzcyI6InVybjpvZGR3b3JrcyJ9.SOANEq0qxkiRL5u3RCAf5glYvDAMtz9LidrLvwsnaTE"
    }
  }
}
```

**NOTE:** You should save this JWT on the device forever to indicate that is a user on the device. The next time your app loads and it hits `/config` it will not generate a user since a **user token** was used.

#### User Token

```json
{
  "channel": "nasa",
  "platform": "web",
  "user": "12345",
  "aud": [
    "platform"
  ],
  "iss": "urn:oddworks"
}
```

This token is identical to the **platform token** except it contains the user ID defined in the user table that the device is making the request for. This token is required for all API calls except for `/config`. The reason for this is so you can track accurate user data throughout the system.

#### JWT Secret
If you did not explicitly set the `JWT_SECRET` environment varaible, it will default to the value `secret`. If you deployed using the Heroku auto-deploy, this environment variable was auto-generated for you and can be found by running the following:

		$ heroku config -a your-heroku-app-name | grep JWT_SECRET
		
#### Generating Tokens

We like to use [jwt.io](https://jwt.io) since it provides a nice interface for generating tokens.

1. Copy either of the token examples above.
2. Paste it into the "PAYLOAD: DATA" section on the right.
3. Ensure the JWT secret in the "VERIFY SIGNATURE" section matches the `JWT_SECRET` environment variable you have set.
4. On the left will have a generated JWT you can copy and paste into the `Authorization` header.

**NOTE:** DO NOT submit an app to the app with a **user token** embedded into the app. It will yield ineffective analytics and cause you to resubmit the app to fix the problem.

## Example Data

By default we use the `nasa` seed function provided by the [@oddnetworks/oddworks-example-data](https://www.npmjs.com/package/@oddnetworks/oddworks-example-data) package.

__You do not need to override example data, but if you want to:__

The configuration file relies on example data and a seed script to get running. For examples of how to set this up yourself, and override the seed script using the `DATA_DIR` environment variable, please check out the [oddworks-example-data](https://github.com/oddnetworks/oddworks-example-data) repo.

You can clone the `oddworks-example-data` repo, or if you want to start working with the seed script within this project you can use the [oddworks-cli](https://www.npmjs.com/package/@oddnetworks/oddworks-cli) and run:

		$ oddworks fetch-data
