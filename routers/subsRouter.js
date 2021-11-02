const express = require('express');
const router = express.Router();
const usersBL = require('../models/usersBL');
const jwt = require('jsonwebtoken');
const jwtBL = require('../JWT/JWTverfier')
const app = express()


app.use(auth)

async function auth(req, res, next) {
    let token = req.headers['x-access-token']
    if (token === "undefined" || !token) { token = req.body.token }
    if (!token) if (req.body.data) token = req.body.data.token
    if (!token) { return res.status(401).send({ auth: false, message: 'No token provided. please refresh the page and relogin. ' }); }
    const isValid = await jwtBL.verify(token)
    if (!isValid) { return res.status(500).send({ auth: false, message: 'Failed to authenticate token, perhaps your time is up. please refresh the page and relogin, or try again in a new tab.' }); }

    return next()
}


router.route('/authFrontEnd')
    .get(async (req, res) => {
        let token = req.headers['x-access-token']
        if (token === "undefined") { return res.status(401).send({ auth: false, message: 'No token provided.' }); }
        const isValid = await jwtBL.verify(token)
        if (!isValid) { return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }); }
        else return res.sendStatus(200)

    })


router.route('/login')
    .post(async (req, res) => {
        let creds = req.body.data.creds
        const username = creds.UserName
        if (await usersBL.checkCreds(creds)) {
            const userId = await usersBL.getIdByUserName(username);
            if (await usersBL.isUserIdIsAdmin(userId) === true) {
                const RSA_PRIVATE_KEY = process.env.SECRET_KEY
                let tokenData = jwt.sign({ id: userId },
                    RSA_PRIVATE_KEY,
                );
                return res.status(200).send({ token: tokenData });
            } else {
                const RSA_PRIVATE_KEY = process.env.SECRET_KEY
                let tokenData = jwt.sign({ id: userId },
                    RSA_PRIVATE_KEY, { expiresIn: await usersBL.returnUserTime(userId) + "m" }
                )
                return res.status(200).send({ token: tokenData });
            }

        }
        else return res.status(401).send({ auth: false, message: 'Wrong username or password' });
    })
router.route('/checkUserName')
    .post(async (req, res) => {
        let username = req.body.data.creds.UserName
        let isAuth = await usersBL.checkUsername(username)
        if (isAuth) await usersBL.saveUserPassword(req.body.data.creds)
        return (isAuth ? res.status(200).json('OK') : res.status(500).json('Invalid username'))

    })
router.route('/addUser')
    .post(auth, async (req, res) => {
        try {
            await usersBL.addUser(req.body.data.creds)
            usersBL.savePermissions(req.body.data.creds)
            usersBL.saveInUsersJson(req.body.data.creds)
            return res.sendStatus(200)
        } catch (err) {
            return res.status(500).send({ message: err });
        }


    })
router.route('/getAllUsersData')
    .get(auth, async (req, res) => {

        let allUsersToMap = await usersBL.returnFullUsersData()
        return res.json((allUsersToMap));

    })
router.route('/editUser')
    .put(auth, async (req, res) => {
        try {
            let response = await usersBL.editUser(req.body.data.userObj, req.body.data.userId)
            res.status(200).send({ message: response });
        } catch (err) {
            res.status(500).send({ message: err });
        }
    })
router.route('/deleteUser')
    .delete(auth, async (req, res) => {

        usersBL.deleteUser(req.body.username)
    })

router.route('/getAllUsers')
    .get(auth, async (req, res) => {
        let allUsers = await usersBL.getAllUsers()
        return res.json(allUsers)

    })
router.route('/getUserTimeById/:id')
    .get(auth, async (req, res) => {
        time = await usersBL.returnUserTime(req.params.id)
        return res.json(time);
    })
module.exports = router;


