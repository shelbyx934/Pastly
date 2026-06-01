import {deleteTextFile, uploadTextFile, getTextFile } from "./src/services/storage.service.js";
import dotenv from 'dotenv';

dotenv.config({ path: "backend/.env" });


const testUploadFile = async () => {
    try {
        const folderid = 31507332713;
        const resp = await uploadTextFile(folderid, "alpha.txt", "Hello Alpha!");
        console.log('Upload result:', typeof resp);

        // remove file

        // const fileid = 88639041972;
        // const deleteResp = await deleteFile(fileid);
        // console.log('Delete result:', deleteResp);

        // get file content
        // const fileid = 88637312590;
        // const content = await getTextFile(fileid);
        // console.log('File content:', content);
    } catch (error) {
        console.error('Error in testUploadFile:', error);
    }
};

testUploadFile();