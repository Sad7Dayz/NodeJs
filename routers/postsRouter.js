const express = require("express");
const postsController = require("../controllers/postsController");
const { identifier } = require("../middlewares/identification");

// 라우터 객체를 생성합니다.
const router = express.Router();

// 회원가입 경로에 대한 POST 요청을 처리합니다.
router.get("/all-posts", postsController.getPosts);
// router.gst("/single-post", postsController.signin);
router.get("/single-post", postsController.singlePost);
router.post("/create-post", identifier, postsController.createPost);

router.put("/update-post", identifier, postsController.updatePost);
router.delete("/delete-post", identifier, postsController.deletePost);

// 라우터를 내보냅니다.
module.exports = router;
