import app from './server.js';
import {MongoClient} from 'mongodb';
import MoviesDAO from './dao/moviesDAO.js';import UsersDAO from './dao/usersDAO.js';import CommentsDAO from './dao/commentsDAO.js';
export function offlineUri(value=process.env.MFLIX_DB_URI){const u=new URL(value);if(u.protocol!=='mongodb:'||!['127.0.0.1','localhost'].includes(u.hostname))throw new Error('Local MongoDB URI required');return value;}
export async function start(port=Number(process.env.PORT||8002)){
 if(!process.env.SECRET_KEY)throw new Error('SECRET_KEY required');
 const client=new MongoClient(offlineUri(),{maxPoolSize:50,writeConcern:{w:'majority',wtimeoutMS:2500},serverSelectionTimeoutMS:5000});await client.connect();
 await MoviesDAO.injectDB(client);await UsersDAO.injectDB(client);await CommentsDAO.injectDB(client);
 const server=await new Promise((resolve,reject)=>{const s=app.listen(port,'127.0.0.1',()=>resolve(s));s.once('error',reject)});
 console.log('MFlix listening at http://127.0.0.1:'+server.address().port);
 return {client,server,close:async()=>{await new Promise(r=>server.close(r));await client.close()}};
}
