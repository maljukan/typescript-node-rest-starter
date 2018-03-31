# TypeScript REST Node Starter

This repository can be used as a convenient starting point for building
Node.js REST API's using TypeScript on top of Express web framework.  

# Features
 - Basic `JWT` authentication and account activation using `SMTP`

# Pre-reqs
- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Configure your SMTP service and enter your SMTP settings inside `.env.example`

# Getting started
- Clone the repository
```
git clone --depth=1 https://github.com/maljukan/typescript-node-rest-starter.git <project_name>
```
- Install dependencies
```
cd <project_name>
npm install
```
- Configure your mongoDB server
```
# create the db directory
sudo mkdir -p /data/db
# give the db correct read/write permissions
sudo chmod 777 /data/db
```
- Start your mongoDB server (you'll probably want another command prompt)
```
mongod
```
- Build and run the project
```
npm run build
npm start
```

# REST endpoints
- public: `/auth/login`, `/auth/register`, `/auth/activate`
- protected: `/users`

# Import mock users
```
mongoimport --db heroes-db --collection users --file users.json --jsonArray
```

# Credits
The repository is based on [Microsoft/TypeScript-Node-Starter
](https://github.com/Microsoft/TypeScript-Node-Starter)