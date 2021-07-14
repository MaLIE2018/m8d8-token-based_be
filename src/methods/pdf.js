import PdfPrinter from "pdfmake"
import fetch from "node-fetch"
import DataURIParser from 'datauri/parser.js';
import isURL from 'validator/lib/isURL.js';
import {pipeline} from "stream"
import { promisify } from "util";
import fs from "fs";
import {extname, join, dirname} from "path"
import { fileURLToPath } from "url";

const asyncPipeline = promisify(pipeline)
const parser = new DataURIParser()
const getDataURI = async (url) => {
  try {
    const res = await fetch(url)
    if(!res.ok) {throw new Error("url is not working")} 
    else {
      let data = await res.buffer();
      const fileSuffix = extname(res.url)
      const dataURI = parser.format(fileSuffix,data).content
      return dataURI
    }
  } catch (error) {
    console.log(error)
  }
}


export const generatePDFStream = async data => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };
  
  const blog = data
  const printer = new PdfPrinter(fonts)
  let url = ""

  if(isURL(blog.cover)){
    url = blog.cover
  }else{
    url = "https://designshack.net/wp-content/uploads/placehold.jpg"
  }
  const dataURI = await getDataURI(url)
  
  let plainText = blog.content.replace(/<[^>]+>/g, '');


  const docDefinition = {
    content: [
      {
        image: dataURI,
        width: 500
      },
      {
        text: blog.title,
        style: 'header'
      },
      {
        text: blog.author.name,
        style: 'subheader'
      },
      {
        text: plainText,
        style: 'normal'
      },
      
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [10, 30, 40, 30]
      },
      subheader: {
        fontSize: 15,
        bold: false,
        margin: [10, 0, 0, 0]
      },
      normal: {
        fontSize: 12,
        bold: false,
        margin: [10, 20, 40, 0]
      },
      quote: {
        italics: true
      },
      small: {
        fontSize: 8
      }
    }
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)

  return pdfReadableStream
}


export const getPDF = async data => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };
  
  const blog = data
  const printer = new PdfPrinter(fonts)
  let url = ""

  if(isURL(blog.cover)){
    url = blog.cover
  }else{
    url = "https://designshack.net/wp-content/uploads/placehold.jpg"
  }
  const dataURI = await getDataURI(url)
  
  let plainText = blog.content.replace(/<[^>]+>/g, '');


  const docDefinition = {
    content: [
      {
        image: dataURI,
        width: 500
      },
      {
        text: blog.title,
        style: 'header'
      },
      {
        text: blog.author.name,
        style: 'subheader'
      },
      {
        text: plainText,
        style: 'normal'
      },
      
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [10, 30, 40, 30]
      },
      subheader: {
        fontSize: 15,
        bold: false,
        margin: [10, 0, 0, 0]
      },
      normal: {
        fontSize: 12,
        bold: false,
        margin: [10, 20, 40, 0]
      },
      quote: {
        italics: true
      },
      small: {
        fontSize: 8
      }
    }
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
  const filePath = join(dirname(fileURLToPath(import.meta.url)), "../data/tempPDF/send.pdf")
  const destination = fs.createWriteStream(filePath)
  pdfReadableStream.end()
  await asyncPipeline(pdfReadableStream, destination)
}

