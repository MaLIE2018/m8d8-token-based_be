import {createReadStream} from "fs"
import { getFilePath } from "./fs-tools.js";
import {promisify} from "util"

const filePath = getFilePath('authors.json')

// const asyncReadStream = promisify()

export const createFileStream = () =>{
  return createReadStream(filePath)
}


 