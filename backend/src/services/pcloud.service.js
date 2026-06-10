import FD from "form-data";
import axios from 'axios';
import crypto from 'crypto';

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
            nopartial: 1,
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
            throw new Error(`HTTP Error : Upload Text File : ${response.status}`);
        }
        const jsonResponse = await response.json();
        return jsonResponse["metadata"][0]["fileid"]
    } catch (error) {
        throw new Error(`Failed to upload text file: ${error.message}`);
    }
};

export const deleteFile = async (fileid) => {
    try {
        const params = new URLSearchParams({
            auth: process.env.PCLOUD_AUTH_TOKEN,
            fileid: fileid
        });
        const response = await fetch(`${BASE_URL}/deletefile?${params.toString()}`, {
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error : Delete File : ${response.status}`);
        }
        const jsonResponse = await response.json();
        // pCloud returns result:0 on success; metadata.isdeleted may be absent
        if (jsonResponse.result !== 0) {
            throw new Error(`pCloud delete error code: ${jsonResponse.result}`);
        }
        return true;
    } catch (error) {
        throw new Error(`Failed to delete file : ${error.message}`);
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
            throw new Error(`HTTP Error : Get Text File : ${response.status}`);
        }

        const jsonResponse = await response.json();
        const host = jsonResponse["hosts"][0];
        const filePath = jsonResponse["path"];
        const downloadUrl = `https://${host}${filePath}`;
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) {
            throw new Error(`HTTP Error : Fetch Text File Content : ${fileResponse.status}`);
        }

        return fileResponse.text();
    } catch (error) {
        throw new Error(`Failed to get text file content: ${error.message}`);
    }
};

// These are methods for tranfer and uses streams.

export const uploadFileStream = async (folderid, fileName, readStream, sizeInBytes, progressHash) => {
    try {
        const formData = new FD();
        formData.append('file', readStream, fileName);

        const params = new URLSearchParams({
            auth: process.env.PCLOUD_AUTH_TOKEN,
            folderid: folderid,
            nopartial: 1,
            overwrite: 0,
            renameifexists: 0,
            mtime: Math.floor(Date.now() / 1000),
            progresshash: progressHash || crypto.randomUUID(),
            iconformat: 'id'
        });

        const response = await axios.post(
            `${BASE_URL}/uploadfile?${params.toString()}`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Length': sizeInBytes,
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
                },
                maxBodyLength: Infinity,
                timeout: 0
            }
        );
        return response.data.metadata[0].fileid;
    } catch (error) {
        console.error(error.cause);
        console.error(error);
        throw new Error(`Error : Upload File Stream : ${error.message}`);
    }
};

export const getPCloudUploadProgress = async (progressHash) => {
    try {
        const params = new URLSearchParams({
            progresshash: progressHash,
            auth: process.env.PCLOUD_AUTH_TOKEN,
        });
        const response = await fetch(`${BASE_URL}/uploadprogress?${params.toString()}`, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to get upload progress: ${error.message}`);
    }
};

// get download link for a file

// [OLD] — getfilelink approach (commented out)
export const getFileDownloadLink = async (fileData) => {
    try {
        const params = new URLSearchParams({
            auth: process.env.PCLOUD_AUTH_TOKEN,
            fileid: fileData.fileId,
            forcedownload: 1
        });
        const response = await fetch(`${BASE_URL}/getfilelink?${params.toString()}`, {
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error : Getting File Download Link : ${response.status}`);
        }
        const jsonResponse = await response.json();
        const host = jsonResponse["hosts"][0];
        const originalFilePath = jsonResponse["path"];
        const downloadFilePath = originalFilePath.split('/')[1] + '/' + fileData.fileName;
        const fileLink = `https://${host}/${downloadFilePath}`;
        console.log(`Generated download link: ${fileLink}`);
        // print response code for filelink using fetch
        const fileResponse = await fetch(fileLink, {
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            }
        });
        console.log(`File link response code: ${fileResponse.status}`);

        return `https://${host}/${downloadFilePath}`;
    } catch (error) {
        throw new Error(`Failed to get file download link: ${error.message}`);
    }
};

// export const getFileDownloadLink = async (fileData) => {
//     try {
//         const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36';

//         // Step i: Get a public share link code for the file
//         const pubLinkParams = new URLSearchParams({
//             auth: process.env.PCLOUD_AUTH_TOKEN,
//             fileid: fileData.fileId,
//         });
//         const pubLinkResponse = await fetch(`${BASE_URL}/getfilepublink?${pubLinkParams.toString()}`, {
//             headers: { 'user-agent': UA }
//         });
//         if (!pubLinkResponse.ok) {
//             throw new Error(`HTTP Error : getfilepublink : ${pubLinkResponse.status}`);
//         }
//         const pubLinkJson = await pubLinkResponse.json();
//         if (pubLinkJson.result !== 0) {
//             throw new Error(`pCloud error on getfilepublink: ${pubLinkJson.result}`);
//         }
//         const code = pubLinkJson.code;

//         // Step ii: Resolve the CDN download URL using the public code
//         const dlParams = new URLSearchParams({
//             fileid: fileData.fileId,
//             code,
//             linkpassword: '',
//             forcedownload: 1,
//         });
//         const dlResponse = await fetch(`${BASE_URL}/getpublinkdownload?${dlParams.toString()}`, {
//             headers: { 'user-agent': UA }
//         });
//         if (!dlResponse.ok) {
//             throw new Error(`HTTP Error : getpublinkdownload : ${dlResponse.status}`);
//         }
//         const dlJson = await dlResponse.json();
//         if (dlJson.result !== 0) {
//             throw new Error(`pCloud error on getpublinkdownload: ${dlJson.result}`);
//         }

//         const host = dlJson.hosts[0];
//         const path = dlJson.path;

//         return `https://${host}${path}`;
//     } catch (error) {
//         throw new Error(`Failed to get file download link: ${error.message}`);
//     }
// };