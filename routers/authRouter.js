const express = require("express");
const authController = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");

// 라우터 객체를 생성합니다.
const router = express.Router();

// 회원가입 경로에 대한 POST 요청을 처리합니다.
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", identifier, authController.signout);

router.patch(
  "/send-verification-code",
  identifier,
  authController.sendVerificationCode
);
router.patch(
  "/verify-verification-code",
  identifier,
  authController.verifyVerificationCode
);
router.patch("/change-password", identifier, authController.changePassword);
router.patch(
  "/send-forgot-password-code",
  authController.sendForgotPasswordCode
);
router.patch(
  "/verify-forgot-password-code",
  authController.verifyForgotPasswordCode
);

// 라우터를 내보냅니다.
module.exports = router;
