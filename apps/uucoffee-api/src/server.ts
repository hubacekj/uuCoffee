import express, { type Express, json, urlencoded } from "express";
import morgan from "morgan";
import cors from "cors";
import api from "./api";
import { errorHandler, notFound } from "./middlewares";

export const createServer = (): Express => {
  const app = express();

  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/", (req, res) => {
      res.status(200).json({ message: req.query });
    })
    .use("/api", api)
    .use(notFound)
    .use(errorHandler);

  return app;
};
