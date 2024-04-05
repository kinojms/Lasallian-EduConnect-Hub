const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

/* ===== POSTS ===== */

//  CREATE POST
router.post("/create-post", (req, res) => {
    const postTag = req.body.postTag;
    console.log("Received post tag:", postTag); 
    if (postTag) {
        switch (postTag) {
            case "Pre-Enlistment":
                postController.createPreEnlistPost(req, res);
                break;
            case "Enlistment":
                postController.createEnlistPost(req, res);
                break;
            case "Student Concerns":
                postController.createConcernPost(req, res);
                break;
            default:
                res.status(400).send("Invalid post tag");
                break;
        }
    } else {
        res.status(400).send("Post tag is required");
    }
});

//  GET POST
router.get("/post/:id", postController.getPostById);

// EDIT POST
router.get("/post/:id/edit", postController.getEditPost);
router.post("/post/:id/edit", postController.postEditPost);

// DELETE POST
router.post("/post/:id/delete", postController.deletePost);

/* ===== COMMENTS ===== */

//  ADD COMMENT
router.post("/post/:id/comment", postController.addComment);

// EDIT COMMENT
router.get("/post/:postId/comment/:commentId/edit", postController.getEditComment);
router.post("/post/:postId/comment/:commentId/edit", postController.postEditComment);

// DELETE COMMENT
router.post("/post/:postId/comment/:commentId/delete", postController.deleteComment);


module.exports = router;