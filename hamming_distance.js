const argv = require('node:process')

function hammingDistance(n1, n2) {
    let x = n1 ^ n2;
    console.log('x: ', x);
    let setBits = 0;

    while (x > 0) {
        setBits += x & 1;
        x >>= 1;
    }

    return setBits;
}

console.log(hammingDistance(argv.argv[2], argv.argv[3]));

