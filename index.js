const express = require('express')
const bcrypt = require("bcrypt")
const mysql = require('mysql')
const fetch = require('node-fetch')

const jwt = require("jsonwebtoken")

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redis = require('redis')
const { promisifyAll } = require('bluebird')
promisifyAll(redis);
const client = redis.createClient(REDIS_PORT)
client.on('error', (err) => console.log('Redis Client Error', err))
require("dotenv").config()


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Mysql connected');
});

const app = express();
app.use(express.json())

function returnData(res, statusCode, message, error = "", data = "") {
    return res.status(statusCode).send({
        statusCode: statusCode,
        message: message,
        error: error,
        data: data
    })
}

function verifyToken(req, res, next) {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({
            statusCode: 403,
            message: "A token is required for authentication",
            error: "Unauthorized"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({
            statusCode: 401,
            message: "Invalid Token",
            error: "Unauthorized"
        })
    }
    return next();
}

async function getUsersData(req, res, next) {
    if (!req.query.username) {
        returnData(res, 400, "username query param is missing", "Bad Request")
    }
    const usernames = req.query.username.split(",")

    if (Object.keys(usernames).length > 10) {
        returnData(res, 400, "username field must not exceed 10", "Bad Request")
    }
    const userData = []
    try {
        for (let i = 0, len = usernames.length; i < len; i++) {
            const userRedis = await client.getAsync(usernames[i]);
            if (userRedis === null) {
                const response = await fetch(`https://api.github.com/users/${usernames[i]}`)
                if (response.status === 403) {
                    returnData(res, 403, response.statusText, response.statusText)
                }
                if (response.status === 200) {
                    const data = await response.json()
                    const user = {}
                    user.name = data.name
                    user.login = data.login
                    user.company = data.company
                    user.followers = data.followers
                    user.public_repos = data.public_repos
                    user.public_repos = data.public_repos
                    user.average_followers = Math.round(data.followers / data.public_repos * 100) / 100
                    await client.setAsync(data.login, JSON.stringify(user), 'EX', 50);
                    user.fromCache = false
                    userData.push(user)
                } else {
                    returnData(res, response.status, response.statusText, response.statusText)
                }
            } else {
                const data = JSON.parse(userRedis.toString())
                data.fromCache = true
                userData.push(data)
            }
        }
        userData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        res.send(userData)
    } catch (error) {
        console.error(error);
        returnData(res, 500, "Something went wrong", "Internal Server Error")
    }
}


app.get('/users/', verifyToken, getUsersData)
app.post("/register", async (req, res) => {
    const username = req.body.username;
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    let user = { username: username, password: hashedPassword }

    let sql = `SELECT * FROM users WHERE username ='${username}'`
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            returnData(res, 409, "Username already exists", "Conflict")
        } else {
            let insertSql = 'INSERT INTO users SET ?'
            db.query(insertSql, user, (err, result) => {
                console.log('result: ', result);
                if (err) throw err
                returnData(res, 201, "User Created", "Success")
            })
        }
    })
})

app.post("/login", async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    let sql = `SELECT * FROM users WHERE username ='${username}'`
    db.query(sql, async (err, result) => {

        if (err) throw err;
        if (result.length == 0) {
            returnData(res, 404, "user not found", "Not Found")
        } else {
            const hashedPassword = result[0].password
            if (await bcrypt.compare(password, hashedPassword)) {
                const user = { username: username, password: hashedPassword }
                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
                returnData(res, 200, "logged in", "", { access_token: token })
            } else {
                returnData(res, 401, "Unauthorized", "Unauthorized")
            }

        }
    })
})

app.listen(5000, () => {
    console.log(`App listening on port ${PORT}`);
})