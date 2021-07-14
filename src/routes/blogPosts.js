import express from 'express';
import {nanoid} from "nanoid"
import { getItems, writeItems,getFilePath, tempPDFPath} from '../methods/fs-tools.js';
import createError from 'http-errors'
import { checkBlogPostSchema, checkValidationResult } from '../methods/validations.js';
import { sendEmail,sendEmailWAtt } from '../methods/email.js';
import { getPDF } from '../methods/pdf.js';
import fs from "fs-extra"
import mongoose from "mongoose"
import blogModel from "../methods/schemas/blogPostSchema.js"
const bpRouter = express.Router();
import {v2 as cloudinary} from "cloudinary"
const filePath = getFilePath("blogPosts.json")
import {basename,extname} from "path"
import q2m from "query-to-mongo"

bpRouter.get("/", async (req, res, next) =>{  
      try { 
      const query = q2m(req.query)
      const total = await blogModel.countDocuments()
      const {skip,limit} = query.options;
      const pages = Math.ceil(total / limit);
      const blogPosts = await blogModel.find({},{}, query.options).populate({path:"author","select":"name surname avatar"}).populate("comments")
      res.status(200).send({Links:{Links:query.links("/blogposts",total), total:total}, posts: blogPosts,pages})
    } catch (err) {
      console.log(err)
      next(err)
    }
})
bpRouter.get("/:id", async ( req, res, next) =>{
  try {
    
    // let blogPosts = await getItems(filePath)
    // let reqPost = blogPosts.find(a => a._id === req.params.id)
    const blogPost = await blogModel.findOne({_id:req.params.id}).populate({path:"author",select:"name avatar surname"})
    if(blogPost){
      res.status(200).send(blogPost)
    } else {
      next(createError(404, {message:`The blogPost with ${req.params.id} is not found`}))
    }
  } catch (err) {
    console.log(err)
    next(err)
  }
})
bpRouter.post("/",checkBlogPostSchema,checkValidationResult, async ( req, res, next) =>{
  try {
    // let blogPosts = await getItems(filePath)
    // let blogPost = {...req.body, _id: nanoid(), createdAt: new Date(),updatedAt: new Date()}
    // blogPosts.push(blogPost)
    // writeItems(filePath, blogPosts)
    const newBlogPost = new blogModel(req.body)
    const {_id} = await newBlogPost.save()
    res.status(201).send({_id: _id})
    
  } catch (err) {
  if(err.name === "ValidationError"){
    console.log(err)
    next(createError(400, {errorList:err}))
  }else{
    next(createError(500, "An error occurred while saving blogPost"))
  }
  }
})


bpRouter.get('/:id/email', async (req, res, next) =>{
  try {
    // let blogPosts = await getItems(filePath)
    // let reqPost = blogPosts.find(a => a._id === req.params.id)
    const reqPost = await blogModel.findById(req.params.id)
    await getPDF(reqPost)
    let pdf = await fs.readFile(tempPDFPath)
    let content = pdf.toString("base64")
    await sendEmailWAtt(reqPost.title, reqPost.author.email, reqPost.content, content)
    // await sendEmail(reqPost[0].title, reqPost[0].author.email, reqPost[0].content)
    res.status(201).send({_id: reqPost._id})
  } catch (error) {
    console.log(error)
    next(error)
  }
  
 
})

bpRouter.put("/:id",checkBlogPostSchema,checkValidationResult, async (req, res, next) =>{
  try {
    // let blogPosts = await getItems(filePath)
    let blogPost = await blogModel.findByIdAndUpdate(req.params.id, req.body,{runValidators: true, new:true})
    if(blogPost){
      res.status(200).send(blogPost)
    } else {
      next(createError(404, {message:`The blogPost with ${req.params.id} is not found`}))
    }
    // if(blogPosts.some(post => post._id === req.params.id)){
    //     let blogPosts = blogPosts.filter(a => a._id !== req.params.id)
    //     let blogPost = {...req.body, _id: req.params.id, updatedAt: new Date()}
    //     blogPosts.push(blogPost)
    //     writeItems(filePath, blogPosts)
    //     res.status(200).send({_id: blogPost._id})
    // } else{
    //   next(createError(404, {message:`The blogPost with ${req.params.id} is not found`}))
    // }
  } catch (err) {
    if(err.name === "ValidationError"){
      next(createError(400,{errorList: err}))
    }else{
      next(createError(500, "An error occurred while saving blogPost"))

    }
  }
})
bpRouter.delete("/:id", async (req, res, next) =>{
  try {
    const blogPost = await blogModel.findByIdAndDelete(req.params.id)
    if(blogPost){
      const publicid_cover = basename(blogPost.cover, extname(blogPost.cover))
      const publicid_avatar = basename(blogPost.author.avatar, extname(blogPost.author.avatar))
      await cloudinary.uploader.destroy( publicid_avatar, function(error,result) {
        console.log(result, error) })
      await cloudinary.uploader.destroy(publicid_cover,  function(error,result) {
        console.log(result, error) })
      res.status(204).send()
    } else {
      next(createError(404, {message:`The blogPost with ${req.params.id} is not found`}))
    }
    // let blogPosts = await getItems(filePath)
    // if(blogPosts.some(post => post._id === req.params.id)){
    //   blogPosts.filter(a => a._id !== req.params.id)
    //   writeItems(filePath, blogPosts)
    //   res.status(204).send()
    // } else{
    //   next(createError(404, {message:`The blogPost with ${req.params.id} is not found`}))
    // }
  } catch (err) {
    console.log(err)
    next(err)
  }
})

export default bpRouter