# Superblocks Authentication Wrapper

This repository contains a React application and AWS Lambda function for white-labeling a multi-page Superblocks Application with custom authentication using Okta.

## Directory Structure

- `./app`:

  - Contains the React app code. This app wraps a Superblocks app and provides custom authentication using Okta while maintaining synchronization between Superblocks multi-page routing and browser routes.

- `./lambda`:
  - Contains the code for the AWS Lambda function that handles user authentication with Superblocks. It accepts user's Okta access and ID tokens, exchanging them for a Superblocks token for seamless authentication.

## Installation

To get started with this project, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/harbolkn/okta-superblocks-embed.git
   cd okta-superblocks-embed
   ```

2. **Install Dependencies**

   Install dependencies for both the React app & lambda code:

   ```bash
   npm install
   ```

3. **Create Okta OIDC Application**

   Follow docs to [Create an Okta OIDC-based Single Page Application](docs/setup-okta-app.md)

4. **Deploy Lambda Function**

   Follow docs to [Deploy Lambda Function](docs/deploy-lambda.md) and configuring API Gateway to handle [Embedded SSO Authentication](https://docs.superblocks.com/applications/embedded-apps/authentication).

5. **Update App Config**

   Update the [`config.js`](app/src/config.js) with your own values, replacing the following values:

   - `OKTA_APP_CLIENT_ID`: Client ID of your Okta OIDC Application that users will use to log in
   - `OKTA_DOMAIN`: The Okta domain associated with you Okta tenant
   - `SUPERBLOCKS_APP_ID`: The Superblocks Application to embed
   - `API_GATEWAY_URL`: The URL of the token endpoint deployed in step #4 above

## Usage

Once the setup is complete, you can run the React app to test locally:

```bash
npm start
```

The app should now be running on `http://localhost:3000`.

For the Lambda function, deploy your code to your AWS environment. Ensure to handle the authentication flows correctly as per your requirements.

### Testing lambda locally

To test the lambda code locally, you'll need to add an environment configuration at `./lambda/.env`. Add the following values to the `.env` file:

```
# Token used to authenticate with the Superblocks Session API
SUPERBLOCKS_TOKEN = ''

# Same Okta issuer found in app/src/config.js
OKTA_ISSUER = ''

# Access & ID Token generated after a user successfully logs in with Okta
OKTA_ACCESS_TOKEN = ''
OKTA_ID_TOKEN = ''
```

Once the `.env` file is configured, run `npm run test:lambda` to test the function.
