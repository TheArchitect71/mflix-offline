import UsersDAO from "../dao/usersDAO.js"
import CommentsDAO from "../dao/commentsDAO.js"
import MoviesDAO from "../dao/moviesDAO.js"
import { User } from "./users.controller.js"
import { ObjectId } from "mongodb"

export default class CommentsController {
  static async apiPostComment(req, res, next) {
    try {
      const userJwt = (req.get("Authorization")||"").slice("Bearer ".length)
      const user = await User.decoded(userJwt)
      var { error } = user
      if (error) {
        res.status(401).json({ error })
        return
      }

      const movieId = req.body.movie_id
      const comment = req.body.comment
      const date = new Date()

      const commentResponse = await CommentsDAO.addComment(
        new ObjectId(movieId),
        user,
        comment,
        date,
      )

      const updatedComments = await MoviesDAO.getMovieByID(movieId)

      res.json({ status: "success", comments: updatedComments.comments })
    } catch (e) {
      res.status(500).json({ e })
    }
  }

  static async apiUpdateComment(req, res, next) {
    try {
      const userJwt = (req.get("Authorization")||"").slice("Bearer ".length)
      const user = await User.decoded(userJwt)
      var { error } = user
      if (error) {
        res.status(401).json({ error })
        return
      }

      const commentId = req.body.comment_id
      const text = req.body.updated_comment
      const date = new Date()

      const commentResponse = await CommentsDAO.updateComment(
        new ObjectId(commentId),
        user.email,
        text,
        date,
      )

      var { error } = commentResponse
      if (error) {
        return res.status(400).json({ error })
      }

      if (commentResponse.modifiedCount === 0) {
        return res.status(403).json({error:"Comment does not belong to this user"})
      }

      const movieId = req.body.movie_id
      const updatedComments = await MoviesDAO.getMovieByID(movieId)

      res.json({ comments: updatedComments.comments })
    } catch (e) {
      res.status(500).json({ e })
    }
  }

  static async apiDeleteComment(req, res, next) {
    try {
      const userJwt = (req.get("Authorization")||"").slice("Bearer ".length)
      const user = await User.decoded(userJwt)
      var { error } = user
      if (error) {
        res.status(401).json({ error })
        return
      }

      const commentId = req.body.comment_id
      const userEmail = user.email
      const commentResponse = await CommentsDAO.deleteComment(
        new ObjectId(commentId),
        userEmail,
      )

      if(commentResponse.deletedCount===0)return res.status(403).json({error:"Comment does not belong to this user"})
      const movieId = req.body.movie_id

      const { comments } = await MoviesDAO.getMovieByID(movieId)
      res.json({ comments })
    } catch (e) {
      res.status(500).json({ e })
    }
  }

  static async apiCommentReport(req, res, next) {
    try {
      const userJwt = (req.get("Authorization")||"").slice("Bearer ".length)
      const user = await User.decoded(userJwt)
      var { error } = user
      if (error) {
        res.status(401).json({ error })
        return
      }

      if (await UsersDAO.checkAdmin(user.email)) {
        const report = await CommentsDAO.mostActiveCommenters()
        res.json({ report })
        return
      }

      res.status(401).json({ status: "fail" })
    } catch (e) {
      res.status(500).json({ e })
    }
  }
}
