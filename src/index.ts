import * as dotenv from "dotenv";
import express, {Express} from 'express'
import bodyParser from "body-parser";
import cors from 'cors'
import errorMiddleware from "./middlewares/errorMiddleware";
import prisma from './services/prisma'
import userRoutes from './routes/v1/userRoutes';
import apiHitLogroutes from './routes/v1/apiHitLogRoutes';
import apiKeyRoutes from './routes/v1/apiKeyRoutes';
import divtikFaceSearchRoutes from "./routes/v1/divtik1NRoutes";
import korlantasFaceSearchRoutes from "./routes/v1/korlantas1NRoutes";
import enrollmentRoutes from "./routes/v1/enrollmentRoutes";
import globalRoutes from './routes/v1/globalRoutes';
import UserDAO, { Create } from './daos/UserDAO';
import crypto from './utils/crypto';
import { UserRole } from "@prisma/client";

dotenv.config();

//Handle bigint returned from postgresql
//@ts-ignore
BigInt.prototype.toJSON = function() {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  }

const app : Express = express();

const PORT = process.env.SERVER_PORT || 9876;
app.get("/", (req,res)=> res.send("Hello"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());
app.use('/public',express.static('public'))

userRoutes(app)
apiHitLogroutes(app)
apiKeyRoutes(app)
divtikFaceSearchRoutes(app)
korlantasFaceSearchRoutes(app)
enrollmentRoutes(app)
globalRoutes(app)

app.use(errorMiddleware);

async function sendMessage(url: string, body: { keyspace: string }, method: string) {
    try {
        console.log(body)
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return await response.json()
    } catch (error) {
        console.log(error)
        throw error
    }
}

async function main(){
    await prisma.$connect()
    console.log(`Successfully connected to database!`)

    let user = await UserDAO.getByEmail_Active_NotDeleted("admin@admin.com")

    if(!user){
        // @ts-ignore
        let initUser: Create = {
            email: 'admin@admin.com',
            nrp: '822222',
            name: 'admin',
            password: 'adminadmin',
            salt: crypto.generateSalt(),
            photo: Buffer.from("", "base64"),
            role: UserRole.ADMIN,
            deleted_at: null
        }
        initUser.password = crypto.generatePassword(initUser.password, initUser.salt)
        await UserDAO.create(initUser)

        console.log(`User admin@admin.com successfully initialized`)
    }

    //Create Korlantas keyspace
    const createKeyspace = await sendMessage("http://localhost:4005/v1/face/keyspace", {"keyspace": "Korlantas"}, "POST")
    console.log("Keyspace Korlantas Created!")

    app.listen(PORT, () => {console.log(`Server ready at port ${PORT}`)})
}

main()
// jobScheduler.initiateJobs();
