const functions = require('firebase-functions')
const cors = require("cors")
const express = require("express")
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

let db = admin.firestore()
const users=db.collection('users')

/* Express with CORS */
const app = express()
app.use(cors({
  origin: true
}))
app.get("/", (request, response) => {
  response.send("Hello from Express on Firebase with CORS!")
})
app.get("/users", (request, response,next) => {
  users.get()
    .then(snapshot=>{
      const data=snapshot.docs.map(doc=>(doc.data()))
      console.log(data)
      response.status(200).send(JSON.stringify(data))
    })
    .catch((err) => {
      console.log('Error getting documents', err)
      response.status(400).send(err)
    })
})
app.post('/new_user',(req,res,next)=>{
  users.add({
    email:req.body['email'],
    name:req.body['name'],
    student_id:req.body['student_id']
  })
    .then(a=>res.status(200))
    .catch(err=>res.status(400).send(err))
})



module.exports.api2 = functions.https.onRequest(app)
