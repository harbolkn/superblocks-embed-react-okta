const axios = require("axios");
const jwt = require('jsonwebtoken');
const OktaJwtVerifier = require('@okta/jwt-verifier');

require('dotenv').config();

const SUPERBLOCKS_TOKEN = process.env.SUPERBLOCKS_TOKEN;

const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: process.env.OKTA_ISSUER,
});

exports.handler = async (event) => {
    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    const idToken = event.headers['x-id-token'] || event.headers['X-ID-Token'];

    if (!authHeader) {
        console.log('No auth header');
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: 'Unauthenticated'
            })
        };
    }

    const token = authHeader.split(' ')[1];

    try {
        // Validate the Okta token
        console.log('Validating token & decode ID Token');
        const oktaJwt = await oktaJwtVerifier.verifyAccessToken(token, 'api://default');
        const decodedIdToken = jwt.decode(idToken, { complete: true });
        const idClaims = decodedIdToken.payload;

        // Create user object from Okta token info
        console.log('Creating user object');
        const user = {
            email: oktaJwt.claims.email || oktaJwt.claims.sub,
            name: idClaims.name || idClaims.preferred_username,
            groupIds: [
                '46943925-7d8e-440a-aa42-67969f1701fc'
            ]
        }

        console.log('Sending token to Superblocks');
        const response = await axios.post(
            'https://app.superblocks.com/api/v1/public/token',
            user,
            {
                headers: {
                    'Authorization': `Bearer ${SUPERBLOCKS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
            }
        );

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        console.error('Token validation failed', error);
        return {
            statusCode: 403,
            body: {
                error: 'Access denied'
            }
        }
    }
}
