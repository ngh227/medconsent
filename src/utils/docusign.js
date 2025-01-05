//src/utils/docusign.js
const docusign = require('docusign-esign');
const { getJWTToken } = require('./auth');

const getUserInfo = async () => {
    try {
        const { accessToken } = await getJWTToken();

        const apiClient = new docusign.ApiClient();
        apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH);
        apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

        const userInfo = await apiClient.getUserInfo(accessToken);

        return {
            accountId: userInfo.accounts[0].accountId,
            accountName: userInfo.accounts[0].accountName,
            baseUri: userInfo.accounts[0].baseUri,
            email: userInfo.email,
            name: userInfo.name,
            userId: userInfo.sub
        };
    }
    catch (error){
        console.error('Error getting user info: ', error);
        throw error;
    }
};

module.exports = { getUserInfo };