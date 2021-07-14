import express  from 'express';
import { getFilePath, getItems, getItemsExceptOneWithIdFromFile, getItemsFromFile, writeImage, writeItems } from './fs-tools.js';
import multer from "multer"
import {extname} from "path"
import {v2 as cloudinary} from "cloudinary"
import {CloudinaryStorage} from "multer-storage-cloudinary"
import { generatePDFStream } from './pdf.js';
import mongoose from "mongoose"
import blogModel from "./schemas/blogPostSchema.js"


const fRouter = express.Router()

const filePath = getFilePath("blogPosts.json")


const cloudinaryStorage = new CloudinaryStorage({
	cloudinary,
params: {
	folder: "BlogPosts",
}
})


fRouter.post("/:id/uploadAvatar",multer ({storage: cloudinaryStorage }).single("authorAvatar"), 
async (req, res, next) => {
  try {
    const blogPost = await blogModel.findById(req.params.id)
    blogPost.author.avatar = req.file.path
    await blogModel.findByIdAndUpdate(req.params.id, blogPost,{runValidators: true, new:true})
    res.status(200).send()
  } catch (error) {
    console.log(error)
    next(error)
  }
  

})

fRouter.post("/:id/uploadCover",multer ({storage: cloudinaryStorage }).single("blogPostCover"),
async (req, res, next) => {
  try {
    const blogPost = await blogModel.findById(req.params.id)
    blogPost.cover = req.file.path
    await blogModel.findByIdAndUpdate(req.params.id, blogPost,{runValidators: true, new:true})
    res.status(204).send()
  } catch (error) {
    console.log(error)
    next(error)
  }

})

fRouter.get("/:id/PDFDownload", async (req, res, next) => {
  try {
    res.setHeader("Content-Type", "application/json")
    // let blogPosts = await getItems(filePath)
    // let reqPost = blogPosts.filter(a => a._id === req.params.id)
    const blogPost = await blogModel.findById(req.params.id)
    const stream = await generatePDFStream(blogPost)
    stream.pipe(res)
    stream.end()
  } catch (error) {
    console.log(error)
  }
})



export default fRouter 

