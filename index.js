// Express 모듈을 가져옵니다. (웹 서버를 생성하기 위한 프레임워크)
const express = require("express");

// Helmet 모듈을 가져옵니다. (보안 관련 HTTP 헤더를 설정)
const helmet = require("helmet");

// CORS 모듈을 가져옵니다. (다른 도메인에서의 요청을 허용)
const cors = require("cors");

// Cookie-parser 모듈을 가져옵니다. (쿠키를 파싱)
const cookieParser = require("cookie-parser");

// MongoDB 모듈을 가져옵니다. (MongoDB 데이터베이스와 연결)
const mongoose = require("mongoose");

// 속도 제한을 설정하기 위한 express-rate-limit 모듈
const rateLimit = require("express-rate-limit");

// 파일 시스템 모듈 (SSL 인증서 파일 읽기 등)
const fs = require("fs");

// HTTPS 서버를 생성하기 위한 모듈
const https = require("https");

// 커스텀 로깅 유틸리티
const logger = require("./utils/logger");

// 버전별 라우터 가져오기
const authRouterV1 = require("./routers/v1/authRouter");
const postsRouterV1 = require("./routers/v1/postsRouter");

// Joi 모듈에서 버전 정보를 가져옵니다. (데이터 검증 라이브러리)
const { version } = require("joi");

// Express 애플리케이션을 생성합니다.
const app = express();

//Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// HTTPS 옵션 설정 (SSL 인증서 로드)
const httpsOptions = {
  key: fs.readFileSync("../NodeJs/certs/certs/key.pem"), // 개인 키 파일
  cert: fs.readFileSync("../NodeJs/certs/certs/cert.pem"), // 인증서 파일
};

// CORS 허용 도메인 목록
const allowlist = [
  "https://localhost:8000",
  "https://my-trusted-site.com",
  "https://another-allowed-site.com",
];

// 기본 속도 제한 설정 (15분 동안 최대 100개의 요청 허용)
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 요청 수
  standardHeaders: true, // 표준 RateLimit 헤더 포함
  legacyHeaders: false, // 비표준 헤더 비활성화
  message: {
    success: false,
    message: "너무 많은 요청이 발생했습니다. 15분 후에 다시 시도해주세요.",
  },
});

// 인증 관련 요청에 대한 더 엄격한 속도 제한 (1시간 동안 최대 5개의 요청 허용)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 5, // IP당 최대 요청 수
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "너무 많은 인증 요청이 발생했습니다. 1시간 후에 다시 시도해주세요.",
  },
});

// CORS 미들웨어 설정 (허용된 도메인만 접근 가능)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowlist.includes(origin)) {
        callback(null, true); // 허용된 도메인
      } else {
        callback(new Error("CORS 정책에 의해 차단되었습니다.")); // 차단된 도메인
      }
    },
    credentials: true, // 쿠키 허용
  })
);

// IP 허용 목록 설정 (허용된 IP만 접근 가능)
const ipAllowlist = ["127.0.0.1"]; // 허용할 IP 목록

app.use((req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress; // 클라이언트 IP 확인
  if (ipAllowlist.includes(clientIp)) {
    next(); // 허용된 IP는 다음 미들웨어로 이동
  } else {
    res.status(403).json({ success: false, message: "접근이 거부되었습니다." }); // 차단된 IP
  }
});

// Helmet 미들웨어를 사용하여 보안 강화
app.use(
  helmet({
    contentSecurityPolicy: false, // 콘텐츠 보안 정책 비활성화
    crossOriginEmbedderPolicy: false, // 교차 출처 임베더 정책 비활성화
  })
);

// JSON 요청 본문을 파싱하는 미들웨어
app.use(express.json());

// URL-encoded 요청 본문을 파싱하는 미들웨어
app.use(express.urlencoded({ extended: true }));

// 쿠키를 파싱하는 미들웨어
app.use(cookieParser());

// 모든 요청에 기본 속도 제한 적용
app.use(defaultLimiter);

// MongoDB 데이터베이스에 연결
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // 새로운 URL 파서 사용
    useUnifiedTopology: true, // 새로운 서버 디스커버리 및 모니터링 엔진 사용
  })
  .then(() => {
    console.log("Database Connected!"); // 연결 성공 메시지
    logger.info("Database", "Database Connected!"); // 로그 기록
  })
  .catch((err) => {
    console.log(err); // 연결 실패 시 에러 출력
    logger.error(err); // 로그 기록
  });

// 특정 엔드포인트에 더 엄격한 속도 제한 적용
app.use("/api/v1/auth/signin", authLimiter);
app.use("/api/v1/auth/signup", authLimiter);
app.use("/api/v1/auth/send-verification-code", authLimiter);
app.use("/api/v1/auth/send-forgot-password-code", authLimiter);

// 버전별 라우터 마운트
app.use("/api/v1/auth", authRouterV1);
app.use("/api/v1/posts", postsRouterV1);

// 루트 경로에 대한 GET 요청 처리
app.get("/", (req, res) => {
  res.json({
    message: "API서버",
    version: {
      v1: {
        status: "활성", // API v1 상태
        endpoints: ["/api/v1/auth", "/api/v1/posts"], // v1 엔드포인트 목록
      },
      // 향후 API 버전을 위한 코드
      // v2: {
      //   status: "베타",
      //   endpoints: ["/api/v2/auth", "/api/v2/posts"]
      // }
    },
  });
});

// 서버를 지정된 포트에서 실행
const PORT = process.env.PORT || 8000; // 환경 변수에서 포트 가져오거나 기본값 8000 사용
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log("listening.."); // 서버 실행 메시지
  logger.info("listening.."); // 로그 기록
});
