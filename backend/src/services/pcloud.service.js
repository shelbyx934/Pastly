const BASE_URL = 'https://apitok2.pcloud.com';

export const uploadTextFile = async (folderid, fileName, content) => {
    try {
        if (!content) {
            throw new Error('Content is required');
        }

        const sizeInBytes = Buffer.byteLength(content, 'utf-8');
        const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

        if (sizeInBytes > maxSizeInBytes) {
            throw new Error('Content exceeds 10MB limit');
        }

        const buffer = Buffer.from(content, 'utf-8');
        const formData = new FormData();
        formData.append('file', new Blob([buffer], { type: 'text/plain' }), fileName);

        const params = new URLSearchParams({
            auth: process.env.PCLOUD_AUTH_TOKEN,
            folderid: folderid,
            nonpartial: 1,
            overwrite: 0,
            renameifexists: 0,
            mtime: Math.floor(Date.now() / 1000),
            progresshash: crypto.randomUUID(),
            iconformat: 'id'
        });

        const response = await fetch(`${BASE_URL}/uploadfile?${params.toString()}`, {
            method: 'POST',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP Error : Upload File : ${response.status}`);
        }
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        return jsonResponse["metadata"][0]["fileid"]
    } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

export const deleteTextFile = async (fileid) => {
    try {
        const params = new URLSearchParams({
            auth: process.env.PCLOUD_AUTH_TOKEN,
            fileid: fileid
        });
        const response = await fetch(`${BASE_URL}/deletefile?${params.toString()}`, {
            method: 'GET',
            headers: {
                'host': 'apitok2.pcloud.com',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error : Delete File : ${response.status}`);
        }
        const jsonResponse = await response.json();
        return jsonResponse["metadata"]["isdeleted"]; // it is a boolean value
    } catch (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

// get file content as text

export const getTextFile = async (fileid) => {
    try {
        const params = new URLSearchParams({
            auth: process.env.PCLOUD_AUTH_TOKEN,
            fileid: fileid,
            forcedownload: 1
        });
        const response = await fetch(`${BASE_URL}/getfilelink?${params.toString()}`, {
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error : Get File Path : ${response.status}`);
        }

        const jsonResponse = await response.json();
        const host = jsonResponse["hosts"][0];
        const filePath = jsonResponse["path"];
        const downloadUrl = `https://${host}${filePath}`;
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) {
            throw new Error(`HTTP Error : Fetch File Content : ${fileResponse.status}`);
        }

        return fileResponse.text();
    } catch (error) {
        throw new Error(`Failed to get file content: ${error.message}`);
    }
};