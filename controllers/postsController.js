const { createPostSchema } = require("../middlewares/validator");
const Post = require("../models/postsModel");

// 게시물 목록을 가져오는 함수
exports.getPosts = async (req, res) => {
  const { page } = req.query; // 요청 쿼리에서 페이지 번호를 가져옵니다.
  const postsPerPage = 10; // 페이지당 게시물 수

  try {
    let pageNum = 0;
    if (page <= 1) {
      pageNum = 0; // 페이지 번호가 1 이하일 경우 0으로 설정
    } else {
      pageNum = page - 1; // 페이지 번호에 따라 계산
    }
    const result = await Post.find()
      .sort({ createdAt: -1 }) // 최신 게시물 순으로 정렬
      .skip(postsPerPage * pageNum) // 페이지에 따라 건너뛸 게시물 수
      .limit(postsPerPage) // 페이지당 게시물 수 제한
      .populate({
        path: "userId", // `userId` 필드를 참조
        select: "email", // 사용자 이메일만 가져옴
      });
    res.status(200).json({ success: true, message: "posts", data: result });
  } catch (error) {
    console.log(error);
  }
};

// 단일 게시물을 가져오는 함수
exports.singlePost = async (req, res) => {
  const { _id } = req.query; // 요청 쿼리에서 게시물 ID를 가져옵니다.

  try {
    const result = await Post.findOne({ _id }).populate({
      path: "userId", // `userId` 필드를 참조
      select: "email", // 사용자 이메일만 가져옴
    });
    res
      .status(200)
      .json({ success: true, message: "single posts", data: result });
  } catch (error) {
    console.log(error);
  }
};

// 게시물을 생성하는 함수
exports.createPost = async (req, res) => {
  const { title, description } = req.body; // 요청 본문에서 제목과 설명을 가져옵니다.
  const { userId } = req.user; // 인증된 사용자 ID를 가져옵니다.
  try {
    // 요청 데이터를 검증합니다.
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    // 게시물을 생성합니다.
    const result = await Post.create({
      title,
      description,
      userId,
    });
    res.status(201).json({ success: true, message: "created", data: result });
  } catch (error) {
    console.log(error);
  }
};

// 게시물을 수정하는 함수
exports.updatePost = async (req, res) => {
  const { _id } = req.query; // 요청 쿼리에서 게시물 ID를 가져옵니다.
  const { title, description } = req.body; // 요청 본문에서 제목과 설명을 가져옵니다.
  const { userId } = req.user; // 인증된 사용자 ID를 가져옵니다.
  try {
    // 요청 데이터를 검증합니다.
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    // 게시물이 존재하는지 확인합니다.
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post unavailable" });
    }

    // 게시물 작성자와 요청 사용자가 일치하는지 확인합니다.
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // 게시물 제목과 설명을 업데이트합니다.
    existingPost.title = title;
    existingPost.description = description;

    const result = await existingPost.save();
    res.status(200).json({ success: true, message: "Updated", data: result });
  } catch (error) {
    console.log(error);
  }
};

// 게시물을 삭제하는 함수
exports.deletePost = async (req, res) => {
  const { _id } = req.query; // 요청 쿼리에서 게시물 ID를 가져옵니다.
  const { userId } = req.user; // 인증된 사용자 ID를 가져옵니다.
  try {
    // 게시물이 존재하는지 확인합니다.
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post already unavailable" });
    }

    // 게시물 작성자와 요청 사용자가 일치하는지 확인합니다.
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // 게시물을 삭제합니다.
    await Post.deleteOne({ _id });
    res.status(200).json({ success: true, message: "deleted" });
  } catch (error) {
    console.log(error);
  }
};
