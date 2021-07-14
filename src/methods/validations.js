import {body, checkSchema, validationResult} from "express-validator"
import createError  from 'http-errors';
//Validation chain
export const blogPostValidation = 
[body("title")
.exists().withMessage("Title is mandatory"),
body("category")
.exists().withMessage("Category is mandatory"),
body("content")
.exists().withMessage("Content is mandatory")
]


const blogPostSchema = {
  title:{ 
    in: ["body"],
    isString: {
      errorMessage: "title validation failed , type must be string",
    }
  },
  category:{ 
    in: ["body"],
    isString: {
      errorMessage: "category validation failed , type must be string",
    }
  },
  content:{ 
    in: ["body"],
    isString: {
      errorMessage: "content validation failed , type must be string",
    }
  }
}


export const checkBlogPostSchema = checkSchema(blogPostSchema)

export const checkValidationResult = (res, req, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    next(createError(400,{errorList: errors}))
  }
  next()
}

// export const blogPostValidation = 
// [body("title")
// .exists().withMessage("Title is mandatory"),
// body("readTime")
// .exists().withMessage("readTime is mandatory"),
// body("category")
// .exists().withMessage("Category is mandatory"),
// body("cover")
// .exists().withMessage("Cover is mandatory"),
// body("author")
// .exists().withMessage("Author is mandatory"),
// body("content")
// .exists().withMessage("Content is mandatory")
// ]


export const authorValidator = [body("")]