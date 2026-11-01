import express from "express";
import bikesController from "../controllers/bikesController.js";

const Router = express.Router();

Router.route("/bikes")
  .get(bikesController.getAllBikes)
  .post(bikesController.createBike);

Router.route("/bikes/:id") // <-- this defines an endpoint with a "placeholder" for the id
  .get(bikesController.getBikeById)
  .put(bikesController.updateBikeById)
  .delete(bikesController.deleteBikeById);

export default Router;