const lowercaseAlphabet = 'abcdefghijklmnopqrstuvwxyz';

const uppercaseAlphabet = lowercaseAlphabet.toUpperCase();

const numberAlphabet = '0123456789';

const letterAlphabet = lowercaseAlphabet + uppercaseAlphabet;

const alphanumericAlphabet = letterAlphabet + numberAlphabet;

export const generateRandomAlphabeticalString = (len: number) => {
    let rv = '';
    for (let i = 0; i < len; ++i) {
        rv += letterAlphabet.charAt(Math.round(Math.random() * letterAlphabet.length));
    }
    return rv;
};

export const generateRandomNumericString = (len: number) => {
    let rv = '';
    for (let i = 0; i < len; ++i) {
        rv += numberAlphabet.charAt(Math.round(Math.random() * numberAlphabet.length));
    }
    return rv;
};

export const generateRandomAlphanumericalString = (len: number) => {
    let rv = '';
    for (let i = 0; i < len; ++i) {
        rv += alphanumericAlphabet.charAt(Math.round(Math.random() * alphanumericAlphabet.length));
    }
    return rv;
};

export const generateUniqueEmail = () => {
    return `test.user+${generateRandomNumericString(10)}@mpanov.com`;
};

export const generateCompliantPassword = () => {
    let rv = '';
    for (let i = 0; i < 5; ++i) {
        rv += uppercaseAlphabet.charAt(Math.round(Math.random() * uppercaseAlphabet.length));
    }
    for (let i = 0; i < 5; ++i) {
        rv += lowercaseAlphabet.charAt(Math.round(Math.random() * lowercaseAlphabet.length));
    }
    for (let i = 0; i < 5; ++i) {
        rv += numberAlphabet.charAt(Math.round(Math.random() * numberAlphabet.length));
    }
    rv += '#/+-';
    return rv;
};

export const generateRandomUrl = () => {
    return `https://${generateRandomAlphabeticalString(10).toLowerCase()}.com`;
};
