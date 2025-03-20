// Express 모듈을 가져옵니다.
const express = require("express");
// Helmet 모듈을 가져옵니다. 보안 관련 HTTP 헤더를 설정합니다.
const helmet = require("helmet");
// CORS 모듈을 가져옵니다. 다른 도메인에서의 요청을 허용합니다.
const cors = require("cors");
// Cookie-parser 모듈을 가져옵니다. 쿠키를 파싱합니다.
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");

const logger = require("./utils/logger");

//버전별 라우터 가져오기
const authRouterV1 = require("./routers/v1/authRouter");
const postsRouterV1 = require("./routers/v1/postsRouter");

const { version } = require("joi");
// Express 애플리케이션을 생성합니다.
const app = express();
// CORS 미들웨어를 사용합니다.
app.use(cors());
// Helmet 미들웨어를 사용합니다.
app.use(helmet());
// JSON 요청 본문을 파싱하는 미들웨어를 사용합니다.
app.use(express.json());
// URL-encoded 요청 본문을 파싱하는 미들웨어를 사용합니다.
app.use(express.urlencoded({ extended: true }));

// 쿠키를 파싱하는 미들웨어를 사용합니다.
app.use(cookieParser());

// MongoDB 데이터베이스에 연결합니다.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // 데이터베이스 연결 성공 시 메시지를 출력합니다.
    console.log("Database Connected!");
    logger.error("Database", "Database Connected!");
  })
  .catch((err) => {
    // 데이터베이스 연결 실패 시 에러를 출력합니다.
    console.log(err);
    logger.error(err);
  });

// 버전별 라우트 마운트
app.use("/api/v1/auth", authRouterV1);
app.use("/api/v1/posts", postsRouterV1);

// 향후 API 버전을 위한 코드
// app.use("/api/v2/auth", authRouterV2);
// app.use("/api/v2/posts", postsRouterV2);

// No버전별 라우트 마운트
// app.use("/api/auth", authRouter);
// app.use("/api/posts", postsRouter);

// 루트 경로에 대한 GET 요청을 처리합니다.
app.get("/", (req, res) => {
  // JSON 형식의 응답을 보냅니다.
  res.json({
    message: "API서버",
    version: {
      v1: {
        status: "활성",
        endpoints: ["/api/v1/auth", "/api/v1/posts"],
      },
      // 향후 API 버전을 위한 코드
      // v2: {
      //   status: "베타",
      //   endpoints: ["/api/v2/auth", "/api/v2/posts"]
      // }
    },
  });
  //res.json({ message: "hello from the server" });
});

// 서버를 지정된 포트에서 실행합니다.
app.listen(process.env.PORT, () => {
  // 서버가 실행 중임을 콘솔에 출력합니다.
  console.log("listening..");
  logger.error("listening..");
});
