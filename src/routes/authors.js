import express from 'express';
import { nanoid } from 'nanoid'
import {getItems, writeItems, getFilePath} from '../methods/fs-tools.js'
import {pipeline} from "stream"
import { Transform } from 'json2csv';
import {createFileStream} from "../methods/csv.js"
import Authors from "../methods/schemas/authorSchema.js"
import { basicAuthMiddleware, JWTMiddleware } from '../methods/auth/basic.js';
import { JWTAuthenticate, JWTRefreshAuth } from '../methods/auth/tools.js';

const ARouter = express.Router();
const filePath = getFilePath('authors.json')

// ********************Requests******************************

ARouter.get("/login",basicAuthMiddleware, async (req, res, next) => {
  try {    
      if(req.user){
        // const accessToken = await JWTAuthenticate(req.user)
        const {accessToken, refreshToken } = await JWTRefreshAuth(req.user)
        res.status(200).send({accessToken, refreshToken})
      }else{
        next(createError(401, {message: "User is not authenticated."}))
      }  
  } catch (error) {
    console.log(error)
    next(error)
  }
})

ARouter.post("/refreshToken", async(req,res, next) => {

  try {
    const {newAccessToken, newRefreshToken} = await refreshTokens(req.body.actualRefreshToken)
    res.send({newAccessToken, newRefreshToken})
  } catch (error) {
    next(error)
  }
})


ARouter.get('/', JWTMiddleware,async (req, res, next) => {
  try {
    const authors = await Authors.find({})
    res.status(200).send(authors)
  } catch (error) {
    next(error)
  }
  
})



ARouter.get('/csv', JWTMiddleware,async (req, res, next) => {
  try {
    const fields = ['name', 'surname', 'email', "dateOfBirth", "avatar", "_id"];
    const opts = { fields };
    const json2csv = new Transform(opts)
    res.setHeader("Content-Disposition", `attachment; filename=export.csv`)
    pipeline(createFileStream(), json2csv, res, error => {if(error){
      next(error)
    }})
    res.status(200).send(await getItems(filePath))
  } catch (error) {
    next(error)
  }
  
})
ARouter.get('/:id', JWTMiddleware,async (req, res) => {
  try {
    const author = Authors.findById(req.params.id)
    res.status(200).send(author)
  } catch (error) {
    
  }
})

ARouter.post('/', JWTMiddleware,async (req, res) => {
  try {
    const author = new Authors(req.body)
    await author.save()
    res.status(201).send({_id: author._id})
  } catch (error) {
    next(createError(500))
  }  
  
})
// Validator as Middleware here
ARouter.put('/:id', JWTMiddleware,async (req, res, next) => {
  try {
    const author = new Authors(req.body)
    await author.save()
    res.status(201).send({_id: author._id})
  } catch (error) {
    next(createError(500)) 
  }
 
})
ARouter.delete('/:id', JWTMiddleware,async (req, res) => {
  try {
    let authors = await getItems(filePath)
    authors.filter(a => a._id !== req.params.id)
    writeItems(filePath, authors)
    res.status(204).send()
  } catch (error) {
    
  }
  
})



export default ARouter;