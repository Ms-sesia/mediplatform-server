import "./config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { json } from "body-parser";
import schema from "./schema";
import graphqlUploadExpress from "./libs/graphql_fileUpload/graphqlUploadExpress";

import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { isAuthenticated } from "./middleWare";
import { authenticateJwt } from "./passport";
import webSocket from "./libs/webSocket/webSocket";
import tobeSchedule from "./libs/scheduler/tobeSchedule";
import apiRoute from "./api/expApi/router";
import { hpMainCheck } from "./libs/1stTimeCreate";
import hspExpiredSchedule from "./libs/scheduler/hspExpiredSchedule";

const PORT = process.env.TEST_SERVER_PORT;

(async () => {
  const app = express();

  const httpServer = http.createServer(app);

  webSocket(httpServer);

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true, // 배포시 false, 개발 및 테스트시 true
    // // 배포시 사용
    // formatError: (err) => {
    //   if (err.extensions) {
    //     delete err.extensions;
    //     delete err.path;
    //     delete err.locations;
    //   }
    //   return err;
    // },
  });

  await server.start();

  app.get("/", (req, res, next) => {
    res.json({ success: true });
    next();
  });

  app.use(authenticateJwt); // 유저 토큰 인증 - 프로젝트 진행시 사용

  // 이미지 혹은 파일들 경로 접속 허용
  app.use(express.static(path.join(__dirname, "../", "images")));
  app.use(express.static(path.join(__dirname, "../", "files")));
  app.use(express.static(path.join(__dirname, "../", "didMedia")));

  tobeSchedule();
  await hspExpiredSchedule();
  await hpMainCheck();

  const corsOptions = {
    // origin: ["https://medipftest.platcube.info"],
    // // optionsSuccessStatus: 200,
    // credentials: true,
  };

  app.use(json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api", apiRoute);

  app.use(graphqlUploadExpress()); // graphql 파일업로드

  app.use(
    "/api-graphql",
    cors(corsOptions),
    helmet({ contentSecurityPolicy: false }), // 배포시 true - 502
    json(),
    // (req, res, next) => {
    //   // if (req.method === "GET") return res.redirect(process.env.ERROR_REDIRECT_URL); // get으로 요청시 에러
    //   if (req.method === "GET") return res.send("잚못된 접근입니다. 다시 시도해주세요."); // get으로 요청시 에러
    //   next();
    // },
    expressMiddleware(server, { context: async ({ req }) => ({ request: req, isAuthenticated }) })
  );

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server ready at http://localhost:${PORT}`);
})();
