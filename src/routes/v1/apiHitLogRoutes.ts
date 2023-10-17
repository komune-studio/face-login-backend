import {Express} from "express";
import * as controller from "../../controllers/apihitlogController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) =>{

    app.route("/v1/api_hit_log").post(auth.user, controller.create)

    app.route("/v1/api_hit_logs").get(auth.user, controller.getAll)

    app.route("/v1/api_hit_log/:id")
        .get(auth.user, controller.getById)

    app.route("/v1/api_hit_log/api_accessed/:api_accessed")
        .get(auth.user, controller.getByApiAccessed)

}
