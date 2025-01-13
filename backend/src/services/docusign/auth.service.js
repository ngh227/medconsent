// services/docusign/auth.service.js
const docusign = require('docusign-esign');
const fs = require('fs').promises;
const path = require('path');

class AuthService {
  constructor() {
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setOAuthBasePath(process.env.AUTH_SERVER);
  }

  async getJWTToken() {
    try {
    console.log('Starting JWT token request');
      const privateKeyPath = path.join(__dirname, '../../../private.key');
      console.log('Reading private key from:', privateKeyPath);
      const privateKey = await fs.readFile(privateKeyPath, 'utf8');
      console.log('Private key loaded successfully');
      
      const response = await this.apiClient.requestJWTUserToken(
        process.env.CLIENT_ID,
        process.env.USER_ID,
        ['signature', 'impersonation'],
        privateKey,
        3600
      );
      console.log('JWT token obtained successfully');

      return {
        accessToken: response.body.access_token,
        expiresIn: response.body.expires_in
      };
    } catch (error) {
        console.error('JWT token request failed:', error);
      throw new Error(`JWT authentication failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await this.apiClient.refreshAccessToken(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        refreshToken
      );
      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
}

module.exports = new AuthService();

// // src/services/docusign/auth.service.js
// const docusign = require('docusign-esign');
// const fs = require('fs').promises;
// const path = require('path');

// require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// const OAUTH_BASE_PATH = process.env.AUTH_SERVER;

// const getJWTToken = async () => {
//     try {
//         const apiClient = new docusign.ApiClient();
//         apiClient.setOAuthBasePath(OAUTH_BASE_PATH);

//         // Read private key
//         const privateKeyPath = path.join(__dirname, '../../private.key');
//         const privateKey = await fs.readFile(privateKeyPath, 'utf8');
        
//         const scopes = ['impersonation'];
//         const response = await apiClient.requestJWTUserToken(
//             process.env.CLIENT_ID,    // Integration Key
//             process.env.USER_ID,      // User ID
//             scopes,                   // Space-separated scopes
//             privateKey,               // Private key
//             3600                      // Token expiration in seconds
//         );

//         if (response?.body?.access_token) {
//             console.log('Successfully obtained access token');
//             return {
//                 accessToken: response.body.access_token,
//                 expiresIn: response.body.expires_in
//             };
//         } else {
//             throw new Error('No access token in response');
//         }

//     } catch (error) {
//         console.error('Full error details:', {
//             message: error.message,
//             status: error.response?.status,
//             statusText: error.response?.statusText,
//             responseData: error.response?.data,
//             responseBody: error.response?.body
//         });
    
//         if (error.response?.data?.error === 'consent_required') {
//             const consentUrl = `https://${OAUTH_BASE_PATH}/oauth/auth?response_type=code&` +
//                 `scope=impersonation&` +
//                 `client_id=${process.env.CLIENT_ID}&` +
//                 `redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`;
    
//             console.log('Consent required. Please visit:', consentUrl);
//             throw new Error('Consent required - check console for URL');
//         }
    
//         throw new Error(`JWT authentication failed: ${error.message}`);
//     }
// };

// /////// CUT FROM HERE /////////

// const getAuthorizationCodeToken = async(code) => {
//     try {
//         const apiClient = new docusign.ApiClient();
//         apiClient.setOAuthBasePath(OAUTH_BASE_PATH);
//         const response = await apiClient.generateAccessToken(
//             process.env.CLIENT_ID,
//             process.env.SECRET_KEY,
//             code
//         );

//         return {
//             accessToken: response.accessToken,
//             refreshToken: response.refreshToken,
//             expiresIn: response.expiresIn
//         };
//     } catch(error) {
//         console.error('Error getting access token: ', error);
//         throw error;
//     }
// };

// const refreshToken = async (refreshToken) => {
//     try {
//         const apiClient = new docusign.ApiClient();
//         apiClient.setOAuthBasePath(OAUTH_BASE_PATH);
//         const response = await apiClient.refreshAccessToken(
//             process.env.CLIENT_ID,
//             process.env.SECRET_KEY,
//             refreshToken
//         );

//         return {
//             accessToken: response.accessToken,
//             refreshToken: response.refreshAccessToken,
//             expiresIn: response.expiresIn
//         };
//     } catch (error){
//         console.error('Error refreshing token: ', error);
//         throw error;
//     }
// };

// module.exports = { 
//     getJWTToken,
//     getAuthorizationCodeToken,
//     refreshToken
//  };
