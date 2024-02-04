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
import morgan from "morgan";
import resAlimSchedule from "./libs/scheduler/resAlimSchedule";

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

  // app.get("/", (req, res, next) => {
  //   res.json({ success: true });
  //   next();
  // });

  app.use(authenticateJwt); // 유저 토큰 인증 - 프로젝트 진행시 사용

  // 이미지 혹은 파일들 경로 접속 허용
  app.use(express.static(path.join(__dirname, "../", "images")));
  app.use(express.static(path.join(__dirname, "../", "files")));
  app.use(express.static(path.join(__dirname, "../", "didMedia")));

  tobeSchedule();
  await hspExpiredSchedule();
  await hpMainCheck();
  await resAlimSchedule();

  const corsOptions = {
    // origin: ["https://mediplatform.platcube.com"],
    // optionsSuccessStatus: 200,
  };

  app.use(json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api", apiRoute);

  app.post("/", bodyParser.json(), (req, res, next) => {
    console.log("인포뱅크 알림톡 전송 결과:", req.body);
    next();
  });

  app.use(graphqlUploadExpress()); // graphql 파일업로드

  app.use(
    "/graphql",
    cors(corsOptions),
    helmet({ contentSecurityPolicy: false }),
    json(),
    expressMiddleware(server, { context: async ({ req }) => ({ request: req, isAuthenticated }) })
  );

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server ready at http://localhost:${PORT}`);
})();
