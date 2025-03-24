const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
  openapi: "3.0.0", // OpenAPI 버전
  info: {
    title: "My API Docs",
    version: "1.0.0",
    description: "Express API with Swagger",
  },
  servers: [
    {
      url: "https://localhost:8000", // API 서버 URL
      description: "Local server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routers/**/*.js"], // API 문서를 자동으로 생성할 파일 경로
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
