
// const auth = require("../middleware/auth");
// const bcrypt = require("bcrypt");
// const { User, validate } = require("../models/user.model");
// const express = require("express");
// const router = express.Router();

const auth = require("../middleware/auth");
const { User, validate } = require("../models/user.model");
const config = require('config');
const jwt = require('jsonwebtoken');


module.exports = {
    authenticate,
    getAll,
    getById
	// ,login
};

// async 
function authenticate(username, password ) {
    const user = users.find(u => u.username === username && u.password === password);
	console.log("looking for %s user obj is %o",username,user);
    if (user) {
		console.log("User %s& pass OK",username );
        const token = jwt.sign({ sub: user.id, role: user.role }, config.get("myprivatekey"));
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token
        };
    }else{
		return {"error": 10,"errorstr": "wrong user or password"};
	}
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

async function getById(id) {
	console.log("getById %i",id);
	var id=parseInt(id);
	try {
		const user = users.find(u => u.id === parseInt(id));
		if (!user) return;
		const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
	} catch(ex) {
		console.log("getById error %o",ex);
	}
}

// async function login(username,password) {
	// console.log("login %s p %s",username,password);
	// try {
		// const user = users.find(u => u.username === username && u.password === password);
		// if (!user) return;
		// const { password, ...userWithoutPassword } = user;
		// return userWithoutPassword;
	// } catch(ex) {
		// console.log("getById error %o",ex);
	// }
// }
