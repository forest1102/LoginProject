const cors = require("cors")
const express = require("express")
const {
	check,
	validationResult
} = require('express-validator')
const bodyParser = require('body-parser')
const uuid = require('uuid/v5')

const {
	db,
	functions,
	auth
} = require('./firebase_service')
const users = db.collection('users')
const {
	verifyToken,
	getAuthToken
} = require('./auth_middleware')

/* Express with CORS */
const app = express()
app.use(cors({
	origin: true
}))
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())

app.get("/", (request, response) => {
	response.send("Hello, Phong!")
})
app.get('/hello', (req, res) => {
	res.send('Hello World. ')
})
app.get("/users", (request, response, next) => {
	users.get()
		.then(snapshot => {
			// const data=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}))
			const data = snapshot.docs.reduce((acc, cur) => ({
				...acc,
				[cur.id]: cur.data()
			}), {})
			console.log(data)
			response.status(200).json(data)
		})
		.catch((err) => {
			console.log('Error getting documents', err)
			response.status(400).send(err)
		})
})
app.get('/user', verifyToken, (req, res, next) => {
	res.send(req.authId)
})

function authenticate(email, password) {
	const reg = /^.*@laccd\.edu$/
	return new Promise((resolve, reject) => {
		if(!reg.test(email)) return reject(new Error('Please Put LACCD email'))
		const uid = uuid(email, uuid.DNS)
		resolve(uid)
	})
}

app.post('/auth', [
		check('email').isEmail(),
		check('password').isString().isLength({
			min: 6,
			max: 12
		}),
	],
	(req, res, next) => {
		const errors = validationResult(req)
		if(!errors.isEmpty()) {
			return res.send(422).json({
				errors: errors.array()
			})
		}
		const {
			email,
			password
		} = req.body
		authenticate(email, password)
			.then((uid) => {
				const userCreation = auth.updateUser(uid, {
					displayName: email,
					email: email,
				}).catch(error => {
					if(error.code === 'auth/user-not-found') {
						return auth.createUser({
							uid: uid,
							email: email,
							displayName: email,
						})
					}
					throw error;
				})
				return userCreation
					.then(() => {
						return auth.createCustomToken(uid, {
							student_id: 'Test'
						})
					})
			})
			.then((token) => {
				res.status(200).send({
					token: token
				})
			})
			.catch(err => {
				res.status(400).send(err)
			})

	})

app.get('/account', verifyToken, (req, res, next) => {
	return res.send(req.user)
})

app.post('/user', [
	check('student_id').isNumeric(),
	verifyToken
], (req, res, next) => {
	const errors = validationResult(req)
	if(!errors.isEmpty()) {
		return res.send(422).json({
			errors: errors.array()
		})
	}
	const student_id = req.body['student_id']
	users.doc(`${req.authId}`)
		.set({
			student_id
		})
		.then(() => {
			res.status(200).send('Success')
		})
		.catch(() => {
			res.status(400).send('Error')
		})
})



module.exports.api2 = functions.https.onRequest(app)
