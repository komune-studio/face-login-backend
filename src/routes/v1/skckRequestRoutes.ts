import {Express} from "express";
import * as controller from "../../controllers/skckRequestController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) => {
    app.route("/v1/skck_request")
        .get(auth.user, controller.getById)
        .post(auth.user, controller.create)
}
