import {Express} from "express";
import * as controller from "../../controllers/enrollmentController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) =>{
    app.route("/v1/enrollments").get(controller.getWithPagination)

    app.route("/v1/enrollment/create").post(controller.create)

    app.route("/v1/enrollment/delete/:subject_id").delete(controller._delete)

    app.route("/v1/enrollment/update_image").put(controller.update)

    app.route("/v1/enrollment/face-login").post(controller.face_login)

    app.route("/v1/enrollment/create/korlantas").post(auth.api_key, auth.api_key_scope["FACE_ENROLLMENT"], controller.create)

    //app.route("/v1/enrollment/face_match").post(auth.api_key, auth.api_key_scope["FACE_MATCH"], controller.faceMatch)

    app.route("/v1/enrollment/:id")
        .delete(controller._delete)
        .put(controller.edit)
        .get( controller.getById)
}
