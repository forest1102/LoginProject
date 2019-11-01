const cors = require("cors")
const express = require("express")
const{check,validationResult}=require('express-validator')
const bodyParser = require('body-parser')

const {db,functions}=require('./firebase_service')
const users=db.collection('users')
const posts=db.collection('posts')
const {verifyToken,getAuthToken}=require('./auth_middleware')

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
app.get('/hello',(req,res)=>{
  res.send('Hello World. ')
})
app.get("/users", (request, response,next) => {
  users.get()
    .then(snapshot=>{
      // const data=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}))
      const data=snapshot.docs.reduce((acc,cur)=>({
        ...acc,
        [cur.id]:cur.data()
      }),{})
      console.log(data)
      response.status(200).json(data)
    })
    .catch((err) => {
      console.log('Error getting documents', err)
      response.status(400).send(err)
    })
})
app.get('/user',verifyToken,(req,res,next)=>{
  res.send(req.authId)
})

app.post('/user',[
  check('student_id').isNumeric(),
  verifyToken
],(req,res,next)=>{
  const errors=validationResult(req)
  if(!errors.isEmpty()){
    return res.send(422).joson({errors:errors.array()})
  }
  const student_id=req.body['student_id']
  users.doc(`${req.authId}`) 
    .set({
      student_id
    })
    .then(()=>{
      res.status(200).send('Success')
    })
    .catch(()=>{
      res.status(400).send('Error')
    })
})

app.get("/posts", (request, response,next) => {
  posts.get()
    .then(snapshot=>{
      // const data=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}))
      const data=snapshot.docs.reduce((acc,cur)=>({
        ...acc,
        [cur.id]:cur.data()
      }),{})
      console.log(data)
      response.status(200).json(data)
    })
    .catch((err) => {
      console.log('Error getting documents', err)
      response.status(400).send(err)
    })
})


module.exports.api2 = functions.https.onRequest(app)
