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

  async verifyStaffAccess(accessToken) {
    try {
        const apiClient = new docusign.ApiClient();
        apiClient.setOAuthBasePath(process.env.AUTH_SERVER);
        
        // Get user info from DocuSign
        const userInfo = await apiClient.getUserInfo(accessToken);
        
        // Log the full userInfo to see what permissions/roles are available
        console.log('DocuSign UserInfo:', JSON.stringify(userInfo, null, 2));
        
        // Check if user has admin/staff permissions in DocuSign
        const hasStaffAccess = userInfo.accounts.some(account => 
            account.accountId === userInfo.accounts[0].accountId && 
            account.isDefault
        );

        return hasStaffAccess;
    } catch (error) {
        console.error('Error verifying staff access:', error);
        return false;
    }
}

}
module.exports = new AuthService();
