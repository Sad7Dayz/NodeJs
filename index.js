// Express 모듈을 가져옵니다.
const express = require("express");
// Helmet 모듈을 가져옵니다. 보안 관련 HTTP 헤더를 설정합니다.
const helmet = require("helmet");
// CORS 모듈을 가져옵니다. 다른 도메인에서의 요청을 허용합니다.
const cors = require("cors");
// Cookie-parser 모듈을 가져옵니다. 쿠키를 파싱합니다.
const cookieParser = require("cookie-parser");
// MongoDB 모듈을 가져옵니다.
const mongoose = require("mongoose");
//속도제한 설정합나디ㅏ.
const rateLimit = require("express-rate-limit");
//fs
const fs = require("fs");
//https
const https = require("https");

const logger = require("./utils/logger");

//버전별 라우터 가져오기
const authRouterV1 = require("./routers/v1/authRouter");
const postsRouterV1 = require("./routers/v1/postsRouter");

const { version } = require("joi");
// Express 애플리케이션을 생성합니다.
const app = express();

const httpsOptions = {
  key: fs.readFileSync("../NodeJs/certs/certs/key.pem"),
  cert: fs.readFileSync("../NodeJs/certs/certs/cert.pem"),
};

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15분
  max: 100, //IP당 15분 동안 최대 100개 요청
  standardHeaders: true, //'RateLimnit-*' 헤더 포함
  legacyHaders: false, //'X-RateLimit-*' 헤더 비활성화
  message: {
    success: false,
    message: "너무 많은 요청이 발생햇습니다. 15분후에 다시 시도해주세요.",
  },
});

//로그인.회원가입 속도 제한 설정
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, //1시간
  max: 5, //IP당 1시간 동안 최대 5개 요청
  standardHeaders: true,
  legacyHaders: false,
  message: {
    success: false,
    message: "너무 많은 인증 요청이 발생햇습니다. 1시간후에 다시 시도해주세요.",
  },
});

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

//모든 요청에 기본 속도 제한 적용
app.use(defaultLimiter);

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

// 특정 엔드포인트에 더 엄격한 속도 제한 적용
app.use("/api/v1/auth/signin", authLimiter);
app.use("/api/v1/auth/signup", authLimiter);
app.use("/api/v1/auth/send-verification-code", authLimiter);
app.use("/api/v1/auth/send-forgot-password-code", authLimiter);

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
const PORT = process.env.PORT || 8000;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log("listening..");
  logger.info("listening..");
});

// app.listen(process.env.PORT, () => {
//   // 서버가 실행 중임을 콘솔에 출력합니다.
//   console.log("listening..");
//   logger.error("listening..");
// });
