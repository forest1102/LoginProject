const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

let db = admin.firestore()
module.exports={
    functions,
    admin,
    db
}
