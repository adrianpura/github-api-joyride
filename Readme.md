# Github API - Backend Engineer Technical Exam

A simple node js api that takes a list of github usernames (up to a maximum of 10 names) and returns to the user a list of basic information for those users including:

1. Name
2. Login
3. Company
4. Number of followers
5. Number of public repositories
6. The average number of followers per public repository (ie. number of followers divided by the number of public repositories)

# Getting started

To get the Node server running locally:

- Clone this repo
- rename `.env.example` to `.env`
- `npm install` to install all required dependencies
- Install Mysql Community Server ([instructions](https://dev.mysql.com/downloads/mysql/))
- Install mySQL Workbench - This is a GUI tool that allow you to easily work with mySQL ([instructions](https://downloads.mysql.com/archives/workbench/))
- `npm run dev` to start the local server

## Authentication

Requests are authenticated using the `x-access-token` header with a valid JWT. We define a middleware in `verifyToken` function that can be used to authenticate requests. I uses our application's `ACCESS_TOKEN_SECRET` and will return a 401 status code if the request cannot be authenticated.

# API Endpoints

| Methods | Urls      | Description                 |
| ------- | --------- | --------------------------- |
| POST    | /register | Create a user               |
| POST    | /login    | User log in                 |
| GET     | /users    | Fetch users on github/redis |

## Dependencies

- [express](https://github.com/expressjs/express) - The server for handling and routing HTTP requests
- [mysql](https://github.com/mysqljs/mysql) - This is a node.js driver for mysql
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - A library to help you hash passwords.
- [bluebird](https://github.com/petkaantonov/bluebird) - Bluebird is a fully featured promise library with focus on innovative features and performance
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication
- [node-fetch](https://github.com/node-fetch/node-fetch) - A light-weight module that brings Fetch API to node.js
- [redis](https://github.com/redis/node-redis) - A modern, high performance Redis client
- [dotenv](https://github.com/motdotla/dotenv) - Loads environment variables from .env file
- [nodemon](https://github.com/remy/nodemon) - Simple monitor script for use during development of a Node.js app

# Calculate Hamming Distance

- `node hamming_distance int1 int2` to call the function
