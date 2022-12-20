import "isomorphic-fetch";
import Koa from "koa";
import koaBody from "koa-body";
import cors from "@koa/cors";
import { router } from "./router/AppRouter";
import { parseCapabilities } from "./router/middlewares";
import { DB } from "./storage/Database";
import { DataGenerator } from "./generators/DataGenerator";
import { ValidationError } from "yup";
import { validate } from "swagger2-koa";
import { koaSwagger } from "koa2-swagger-ui";

import {
  OctoError,
  InternalServerError,
  BadRequestError,
} from "./models/Error";

import * as swagger from "swagger2";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yamljs = require("yamljs");

const document = swagger.loadDocumentSync("./swagger.yml");
// import {router as swaggerRouter, Router} from 'swagger2-koa';
// const swRouter: Router = swaggerRouter(document);

// validate document
if (!swagger.validateDocument(document)) {
  throw Error(`./swagger.yml does not conform to the Swagger 2.0 schema`);
}

const app = new Koa();

DB.getInstance().open();
app.use(cors());
app.use(koaBody());
// @ts-ignore
app.use(validate(document));
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // console.log(err);
    if (err instanceof OctoError) {
      ctx.status = err.status;
      ctx.body = err.body;
    } else if (err instanceof ValidationError) {
      const error = new BadRequestError(err.message);
      ctx.status = error.status;
      ctx.body = error.body;
    } else {
      const error = new InternalServerError(err.message);
      ctx.status = error.status;
      ctx.body = {
        ...error.body,
        stack: error.stack,
      };
    }
  }
});
app.use(async (ctx, next) => {
  ctx.set("x-request-id", DataGenerator.generateUUID());
  await next();
});

const spec = yamljs.load("./swagger.yml");
// example 1 using router.use()
// router.use(koaSwagger({ swaggerOptions: { spec } }));
router.get(
  "/docs",
  koaSwagger({ routePrefix: false, swaggerOptions: { spec } })
);

router.get("/ping", async (context) => {
  context.status = 200;
  context.body = {
    serverTime: new Date().toISOString(),
  };
});

app.use(parseCapabilities);
app.use(router.routes());
app.listen(3000);
