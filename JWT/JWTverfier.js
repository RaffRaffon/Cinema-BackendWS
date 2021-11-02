const jwt = require('jsonwebtoken');
const RSA_PRIVATE_KEY = process.env.SECRET_KEY;


function verify(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, RSA_PRIVATE_KEY, function (err) {
            if (err) {
                console.log("this is the token"+token);
                console.log(err)
                resolve(false)
            }
            else resolve(true)
        })
    })
}


module.exports = { verify }