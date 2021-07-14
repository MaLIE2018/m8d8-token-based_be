import authorModel from "../schemas/authorSchema.js"
import atob from "atob"
import  createError  from 'http-errors';
import { verifyToken } from "./tools.js";


export const JWTMiddleware = async(req,res,next) => {
  if(!req.headers.authorization){
    next(createError(401, {message:"Authorization required"}))
  }else{
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      
      const content = await verifyToken(token)
  
      const user = await authorModel.findById(content._id)
  
      if(user){
        req.user = user
        next()
      }else{
        next(createError(404, {message:"User not found"}))
      }
      
    } catch (error) {
      next(createError(401, {message:"Token not valid"}))
    }

  }

}



export const basicAuthMiddleware = async (req, res, next) => {
  console.log("Basic")
  if(!req.headers.authorization) {
      next(createError(401, {message: 'Authorization required'}));
  }else{
    const decoded = atob(req.headers.authorization.split(' ')[1])
    const [email, password] = decoded.split(":")

    const user = await authorModel.checkCredentials(email, password)

    if(user){
      req.user = user
      next()
    }else{
      next(createError(401, {message:"Credentials are wrong"}))
    }


  }
}