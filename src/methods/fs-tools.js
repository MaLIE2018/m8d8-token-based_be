import fs from "fs-extra"
import { fileURLToPath } from 'url';
import {dirname, join} from 'path';


const dataFilesPath = join(dirname(fileURLToPath(import.meta.url)), "../data")


export const publicFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img")
export const publicFolderPath2 = join(dirname(fileURLToPath(import.meta.url)), "../../public")
export const tempPDFPath = join(dirname(fileURLToPath(import.meta.url)), "../data/tempPDF/send.pdf")
export const getFilePath = (fileName) => join(dataFilesPath, fileName)
export const getItems = async filePath => await fs.readJson(filePath)
export const writeItems = async (filePath,data) => 
await fs.writeJson(filePath,data)
export const writeImage = async (filePathEnd, data) => await fs.writeFile(join(publicFolderPath,filePathEnd), data)


export const getItemsFromFile = async (filePath, id) => {
  const items = await getItems(filePath)
  return items.filter(item => item._id === id)
}

export const getItemsExceptOneWithIdFromFile = async (filePath, id) => {
  const items = await getItems(filePath)
  return items.filter(item => item._id !== id)
}


