import "./config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import bodyParser, { json } from "body-parser";
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
import resAlimSchedule from "./libs/scheduler/resAlimSchedule";
import { createAlimTalkLog } from "./libs/infoKakaoAlim/createLog";

const PORT = process.env.SERVER_PORT;

(async () => {
  const app = express();

  const httpServer = http.createServer(app);

  webSocket(httpServer);

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true, // 배포시 false, 개발 및 테스트시 true
  });

  await server.start();

  app.use(authenticateJwt); // 유저 토큰 인증 - 프로젝트 진행시 사용

  // 이미지 혹은 파일들 경로 접속 허용
  app.use(express.static(path.join(__dirname, "../", "images")));
  app.use(express.static(path.join(__dirname, "../", "files")));
  app.use(express.static(path.join(__dirname, "../", "didMedia")));

  tobeSchedule();
  await hspExpiredSchedule();
  await hpMainCheck();
  await resAlimSchedule();

  const corsOptions = {};

  app.use(json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api", apiRoute);

  app.post("/", bodyParser.json(), createAlimTalkLog);
  // app.post("/infobank/alimtalk/report", bodyParser.json(), createAlimTalkLog); => 등록 요청

  app.use(graphqlUploadExpress()); // graphql 파일업로드

  app.use(
    "/api-graphql",
    cors(corsOptions),
    helmet({ contentSecurityPolicy: false }),
    json(),
    expressMiddleware(server, { context: async ({ req }) => ({ request: req, isAuthenticated }) })
  );

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server ready at http://localhost:${PORT}`);
})();
