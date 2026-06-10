// create a controller to test https://api.pcloud.com/getapiserver and return response as json
// using simple fetch api
// directly here not pre built methods

// use native fetch in node 18+

const BASE_URL = 'https://api.pcloud.com';

export const testPCloudApi = async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/getapiserver`);
        result = await response.json();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};