import authorModel from "../schemas/authorSchema.js"
import atob from "atob"
import  createError  from 'http-errors';

export const basicAuthMiddleware = async (req, res, next) => {
  console.log("Basic")
  if(!req.headers.authorization) {
      next(createError(401, {message: 'Authorization required'}));
  }else{
    const decoded = atob(req.headers.authorization.split(' ')[1])
    const [email, password] = decoded.split(":")

    const user = await authorModel.checkCredentials(email, password)
    console.log('user:', user)

    if(user){
      req.user = user
      next()
    }else{
      next(createError(401, {message:"Credentials are wrong"}))
    }


  }
}