import bcrypt from "bcryptjs"
import {randomUUID} from "node:crypto"
import jwt from "jsonwebtoken"
import UsersDAO from "../dao/usersDAO.js"

const hashPassword = async password => await bcrypt.hash(password, 10)

export class User {
  constructor({ name, email, password, preferences = {} } = {}) {
    this.name = name
    this.email = email
    this.password = password
    this.preferences = preferences
  }
  toJson() {
    return { name: this.name, email: this.email, preferences: this.preferences }
  }
  async comparePassword(plainText) {
    return await bcrypt.compare(plainText, this.password)
  }
  encoded() {
    return jwt.sign(
      {
        jti: randomUUID(),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        ...this.toJson(),
      },
      process.env.SECRET_KEY,
    )
  }
  static async decoded(userJwt) {
    try {const claims=jwt.verify(userJwt,process.env.SECRET_KEY);const session=await UsersDAO.getUserSession(claims.email);const data=await UsersDAO.getUser(claims.email);if(!data||session?.jwt!==userJwt)return {error:'Session expired; sign in again'};return new User(data)}catch(error){return {error:'Invalid or expired token'}}
  }
}

export default class UserController {
  static async register(req, res) {
    try {
      const userFromBody = req.body
      let errors = {}
      if (typeof userFromBody?.password !== "string" || userFromBody.password.length < 8) {
        errors.password = "Your password must be at least 8 characters."
      }
      if (typeof userFromBody?.name !== "string" || userFromBody.name.length < 3) {
        errors.name = "You must specify a name of at least 3 characters."
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      const userInfo = {
        ...userFromBody,
        password: await hashPassword(userFromBody.password),
      }

      const insertResult = await UsersDAO.addUser(userInfo)
      if (!insertResult.success) {
        errors.email = insertResult.error
      }
      const userFromDB = await UsersDAO.getUser(userFromBody.email)
      if (!userFromDB) {
        errors.general = "Internal error, please try again later"
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      const user = new User(userFromDB)
      const token=user.encoded();await UsersDAO.loginUser(user.email,token)
      res.json({
        auth_token: token,
        info: user.toJson(),
      })
    } catch (e) {
      res.status(500).json({ error: e })
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body
      if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Bad email format, expected string." })
        return
      }
      if (!password || typeof password !== "string") {
        res.status(400).json({ error: "Bad password format, expected string." })
        return
      }
      let userData = await UsersDAO.getUser(email)
      if (!userData) {
        res.status(401).json({ error: "Make sure your email is correct." })
        return
      }
      const user = new User(userData)

      if (!(await user.comparePassword(password))) {
        res.status(401).json({ error: "Make sure your password is correct." })
        return
      }

      const token=user.encoded();const loginResponse = await UsersDAO.loginUser(user.email, token)
      if (!loginResponse.success) {
        res.status(500).json({ error: loginResponse.error })
        return
      }
      res.json({ auth_token: token, info: user.toJson() })
    } catch (e) {
      res.status(400).json({ error: e })
      return
    }
  }

  static async logout(req, res) {
    try {
      const userJwt = (req.get("Authorization")||"").slice("Bearer ".length)
      const userObj = await User.decoded(userJwt)
      var { error } = userObj
      if (error) {
        res.status(401).json({ error })
        return
      }
      const logoutResult = await UsersDAO.logoutUser(userObj.email)
      var { error } = logoutResult
      if (error) {
        res.status(500).json({ error })
        return
      }
      res.json(logoutResult)
    } catch (e) {
      res.status(500).json(e)
    }
  }

  static async delete(req, res) {
    try {
      let { password } = req.body
      if (!password || typeof password !== "string") {
        res.status(400).json({ error: "Bad password format, expected string." })
        return
      }
      const userJwt = (req.get("Authorization")||"").slice("Bearer ".length)
      const userClaim = await User.decoded(userJwt)
      var { error } = userClaim
      if (error) {
        res.status(401).json({ error })
        return
      }
      const user = new User(await UsersDAO.getUser(userClaim.email))
      if (!(await user.comparePassword(password))) {
        res.status(401).json({ error: "Make sure your password is correct." })
        return
      }
      const deleteResult = await UsersDAO.deleteUser(userClaim.email)
      var { error } = deleteResult
      if (error) {
        res.status(500).json({ error })
        return
      }
      res.json(deleteResult)
    } catch (e) {
      res.status(500).json(e)
    }
  }

  static async save(req, res) {
    try {
      const userJwt = (req.get("Authorization")||"").slice("Bearer ".length)
      const userFromHeader = await User.decoded(userJwt)
      var { error } = userFromHeader
      if (error) {
        res.status(401).json({ error })
        return
      }

      await UsersDAO.updatePreferences(
        userFromHeader.email,
        req.body.preferences,
      )
      const userFromDB = await UsersDAO.getUser(userFromHeader.email)
      const updatedUser = new User(userFromDB)
      const token=updatedUser.encoded();await UsersDAO.loginUser(updatedUser.email,token)
      res.json({
        auth_token: token,
        info: updatedUser.toJson(),
      })
    } catch (e) {
      res.status(500).json(e)
    }
  }

  // for internal use only
  static async createAdminUser(req, res) {
    try {
      const userFromBody = req.body
      let errors = {}
      if (typeof userFromBody?.password !== "string" || userFromBody.password.length < 8) {
        errors.password = "Your password must be at least 8 characters."
      }
      if (typeof userFromBody?.name !== "string" || userFromBody.name.length < 3) {
        errors.name = "You must specify a name of at least 3 characters."
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      const userInfo = {
        ...userFromBody,
        password: await hashPassword(userFromBody.password),
      }

      const insertResult = await UsersDAO.addUser(userInfo)
      if (!insertResult.success) {
        errors.email = insertResult.error
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      const makeAdminResponse = await UsersDAO.makeAdmin(userFromBody.email)

      const userFromDB = await UsersDAO.getUser(userFromBody.email)
      if (!userFromDB) {
        errors.general = "Internal error, please try again later"
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      const user = new User(userFromDB)
      const jwt = user.encoded()
      const loginResponse = await UsersDAO.loginUser(user.email, jwt)

      res.json({
        auth_token: jwt,
        info: user.toJson(),
      })
    } catch (e) {
      res.status(500).json(e)
    }
  }
}
