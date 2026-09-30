import express from "express"
import path from "node:path"
import fs from "node:fs"
import {fileURLToPath} from "node:url"
import cors from "cors"
import morgan from "morgan"
import movies from "../src/api/movies.route.js"
import users from "../src/api/users.route.js"

const app = express()

app.set("query parser", "extended")
app.use(cors())
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Register api routes
app.use("/api/v1/movies", movies)
app.use("/api/v1/user", users)
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ui=path.join(root,'frontend/dist/mflix/browser');
if(fs.existsSync(ui)){app.use(express.static(ui));app.get('/{*path}',(req,res,next)=>req.path.startsWith('/api/')?next():res.sendFile(path.join(ui,'index.html')))}else{app.use(express.static(path.join(root,'build')))}
app.use((req,res)=>res.status(404).json({error:'not found'}));
app.use((error,req,res,next)=>res.status(500).json({error:error.message}));
export default app;
