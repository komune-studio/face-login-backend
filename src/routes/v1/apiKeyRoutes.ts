import {Express} from "express";
import * as controller from "../../controllers/apikeyController"
import auth from "../../middlewares/authMiddleware";

export default (app: Express) =>{

    app.route("/v1/api_key").post(auth.user, controller.create)

    app.route("/v1/api_key/:id")
    .get(auth.user, controller.getById)
    .put(auth.user, controller.edit)
    .delete(auth.user,controller.deactivate)
    .patch(auth.user, controller.restore)

    app.route("/v1/api_key/delete/:id")
        .delete(auth.user, controller.delete_)

    app.route("/v1/api_key/key/:key")
        .get(auth.user, controller.getByKey)

    app.route("/v1/api_keys").get(auth.user, controller.getAll)

}
