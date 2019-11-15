const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp({
    ...functions.config().firebase,
    credential:admin.credential.cert('./secret/quickstart-1555129014263-firebase-adminsdk-xmypq-bbd6113798.json')
})

let db = admin.firestore()
module.exports={
    functions,
    admin,
    db,
    auth:admin.auth()
}
