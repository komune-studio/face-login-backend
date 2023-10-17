import {Express} from "express";
import * as controller from "../../controllers/korlantas1NController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) =>{
    app.route("/v1/korlantas_1N").post(auth.api_key, auth.api_key_scope["SIM"], controller.korlantas1N)
}
