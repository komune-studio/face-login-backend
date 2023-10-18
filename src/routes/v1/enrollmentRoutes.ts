import {Express} from "express";
import * as controller from "../../controllers/enrollmentController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) =>{
    app.route("/v1/enrollments").get(auth.user, controller.getWithPagination)

    app.route("/v1/enrollment/create").post(controller.create)

    app.route("/v1/enrollment/create/korlantas").post(auth.api_key, auth.api_key_scope["FACE_ENROLLMENT"], controller.create)

    //app.route("/v1/enrollment/face_match").post(auth.api_key, auth.api_key_scope["FACE_MATCH"], controller.faceMatch)

    app.route("/v1/enrollment/:id")
        //.delete(auth.user, controller.delete_)
        .put(auth.user, controller.edit)
        .get(auth.user, controller.getById)
}
