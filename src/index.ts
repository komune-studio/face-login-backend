import * as dotenv from "dotenv";
import express, {Express} from 'express'
import bodyParser from "body-parser";
import cors from 'cors'
import errorMiddleware from "./middlewares/errorMiddleware";
import prisma from './services/prisma'
import enrollmentRoutes from "./routes/v1/enrollmentRoutes";
import globalRoutes from "./routes/v1/globalRoutes";
import skckRequestRoutes from "./routes/v1/skckRequestRoutes";

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

enrollmentRoutes(app)
globalRoutes(app)
skckRequestRoutes(app)

app.use(errorMiddleware);

async function main(){
    await prisma.$connect()
    console.log(`Successfully connected to database!`)

    app.listen(PORT, () => {console.log(`Server ready at port ${PORT}`)})
}

main()
// jobScheduler.initiateJobs();
