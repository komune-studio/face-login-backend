import {Express} from "express";
import * as controller from "../../controllers/divtik1NController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) =>{
    app.route("/v1/divtik_1N").post(auth.api_key, auth.api_key_scope["DIVTIK"], controller.divtik1N)
}
