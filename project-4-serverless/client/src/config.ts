// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'irj37lzkqk'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-1lfrhhw5.us.auth0.com',            // Auth0 domain
  clientId: 'zz9iuHS0qQEzJ4Qlaa78u4NJApWDZ4hz',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
