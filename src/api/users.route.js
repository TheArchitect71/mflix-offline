import { Router } from "express"
import usersCtrl from "./users.controller.js"
import UsersDAO from "../dao/usersDAO.js"
import {User} from "./users.controller.js"
import commentsCtrl from "./comments.controller.js"

const router = new Router()

// associate put, delete, and get(id)
router.route("/register").post(usersCtrl.register)
router.route("/login").post(usersCtrl.login)
router.route("/logout").post(usersCtrl.logout)
router.route("/delete").delete(usersCtrl.delete)
router.route("/update-preferences").put(usersCtrl.save)
router.route("/comment-report").get(commentsCtrl.apiCommentReport)
router.route("/make-admin").post(usersCtrl.createAdminUser)

router.get('/admin',async(req,res)=>{const user=await User.decoded((req.get('Authorization')||'').replace(/^Bearer /,''));if(user.error||!await UsersDAO.checkAdmin(user.email))return res.status(401).json({error:'Administrator access required'});res.json({status:'success'})});
router.get('/session',async(req,res)=>{const user=await User.decoded((req.get('Authorization')||'').replace(/^Bearer /,''));if(user.error)return res.status(401).json({error:user.error});res.json({info:user.toJson()})});
export default router
