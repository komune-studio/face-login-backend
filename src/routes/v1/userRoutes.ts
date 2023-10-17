import {Express} from "express";
import * as controller from "../../controllers/userController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) =>{

    app.route("/v1/user").post(controller.create)

    app.route("/v1/users").get(auth.user, controller.getAll)

    app.route("/v1/user/self")
        .get(auth.user, controller.getSelf)
        .put(auth.user, controller.editSelf)

    app.route("/v1/user/:id")
        .get(auth.user, controller.getById)
        .put(auth.user, controller.edit)
        .delete(auth.user, controller.deactivate)
        .patch(auth.user, controller.restore)

    app.route("/v1/user/login").post(controller.login)

    app.route("/v1/user/delete/:id").delete(auth.user, controller.delete_)

}
