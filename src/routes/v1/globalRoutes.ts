import {Express} from "express";
import * as controller from "../../controllers/globalController"
import auth from "../../middlewares/authMiddleware";
import {faceDetection} from "../../controllers/globalController";

export default (app: Express) =>{

    app.route("/v1/dashboard_summary").get(auth.user, controller.getDashboardSummary)
    app.route("/v1/face_detection").post(auth.api_key, auth.api_key_scope["FACE_DETECTION"], controller.faceDetection)

}
