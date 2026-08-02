const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(BASE62_ALPHABET.length);

function encodeBase62(value) {
    let number = typeof value === 'bigint' ? value : BigInt(value);

    if (number < 0n) {
        throw new RangeError('Base62 encoding only supports non-negative values.');
    }

    if (number === 0n) {
        return BASE62_ALPHABET[0];
    }

    let encoded = '';

    while (number > 0n) {
        const remainder = Number(number % BASE);
        encoded = BASE62_ALPHABET[remainder] + encoded;
        number /= BASE;
    }

    return encoded;
}

module.exports = { BASE62_ALPHABET, encodeBase62 };
