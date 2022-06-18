require('dotenv').config();
const crypto = require('crypto');
const { encrypt, decrypt } = require('../routes/helperFunctions/crypto');
 
const algorithm = process.env.ALGORITHM
const secretKey = process.env.SECRET_KEY
 
afterAll(done => {
    done();
});
 
test("encrypt", () => {
 const checker = encrypt("bob");
 expect(checker).not.toEqual("bob"); // this checks if it was turned into hex and matches properly
});

test("decrypt", () => {
 const checker = encrypt("bob");
 const decryptChecker = decrypt(checker) // putting the orginal word in here but its supposed to be hash??
 expect(decryptChecker).toEqual("bob")
});
