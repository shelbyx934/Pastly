// create a controller to test https://api.pcloud.com/getapiserver and return response as json
// using simple fetch api
// directly here not pre built methods

// use native fetch in node 18+

export const testPCloudApi = async (req, res) => {
    try {
        const response = await fetch('https://api.pcloud.com/getapiserver');
        const result = await response.json();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};