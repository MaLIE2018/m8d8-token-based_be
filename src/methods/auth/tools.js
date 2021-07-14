import jwt from "jsonwebtoken";


// JWTRefreshToken

export const JWTRefreshAuth = async user => {
  const accessToken = await generateTempJWT({_id: user._id});
  const refreshToken = await generateRefreshToken({_id: user._id});

  user.refreshToken = refreshToken

  await user.save();
  return {accessToken, refreshToken};
}


const generateRefreshToken = payload => new Promise((resolve, reject)=> 
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1 week"}, (err, token) => {
      if(err) reject(err)

      resolve(token)
    })
)

const generateTempJWT = payload => new Promise((resolve, reject) => 
jwt.sign(payload, process.env.JWT_SECRET,{expiresIn: "10 sec"}, (err, token) => {
  if(err) reject(err)

  resolve(token)
}))

const verifyRefreshToken = token => new Promise((resolve,reject) => 
jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
  if(err) reject(err)

  resolve(decodedToken)
}))


export const refreshTokens = async actualRefreshToken => {
  const content = await verifyRefreshToken(actualRefreshToken)

  const user = await UserModel.findById(content._id)

  if(!user) throw new Error("User not found")

  if(user.refreshToken === actualRefreshToken) {
    const newAccessToken = await generateTempJWT({_id: user._id})
    const newRefreshToken = await generateRefreshToken({_id: user._id})


    user.refreshToken = newRefreshToken

    await user.save()

    return {newAccessToken, newRefreshToken}
  } else{
    throw new Error("Refresh Token not valid!")
  }

}


//JSON Web Token

export const JWTAuthenticate = async user => {

  const accessToken = await generateJWT({_id: user._id})

  return accessToken;
}

const generateJWT = payload => 
  new Promise((resolve, reject)=> 
  jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1 week"}, (err, token) => {
  if(err) reject(err)
  
  resolve(token)
  }
))

export const verifyToken = token => 
  new Promise((resolve, reject)=> jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
  if(err) reject(err)

  resolve(decodedToken)
  }))