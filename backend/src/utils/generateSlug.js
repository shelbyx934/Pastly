import { customAlphabet } from 'nanoid';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateSlug = () => {
    return customAlphabet(alphabet, 7)();
};

export default generateSlug;