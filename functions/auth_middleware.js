const {admin}=require('./firebase_service')

function getAuthToken(req, res, next){
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      req.authToken = req.headers.authorization.split(' ')[1]
      console.log(req.authToken)
      
    } else {
      req.authToken = null
    }
    next()
}

function verifyToken(req,res,next){
    getAuthToken(req, res, async () => {
      try {
        const {
          authToken
        } = req
        const userInfo = await admin
          .auth()
          .verifyIdToken(authToken)

        req.authId = userInfo.uid
        req.user=userInfo
        if(req.authId){
            next()
        }
        else{
            throw new Error('unauthorized')
        }

      } catch (e) {
        return res
          .status(401)
          .send({
            error: 'You are not authorized to make this request'
          })
      }
    })
}
module.exports={
  verifyToken,
  getAuthToken
}