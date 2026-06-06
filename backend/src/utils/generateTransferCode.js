// This function generates a random 6 digit numerical code for transfer verification

const generateTransferCode = () => {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return code;
}

export default generateTransferCode;