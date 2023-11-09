import {Express} from "express";
import * as controller from "../../controllers/globalController"

export default (app: Express) =>{
    app.route("/v1/ocr").post(controller.ocr)
}
