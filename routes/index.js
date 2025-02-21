const express =  require('express')
const router = express.Router();
const multer = require('multer'); 
const { UserController, PostController, CommentController, FollowController, SaveController } = require('../controllers');
const authentificateToken = require('../middleware/auth.js');
const {registerValidation, loginValidation, postCreateValidation, commentCreateValidation } = require('../validation/validation.js')


const uploadDestination = 'uploads'

const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

const uploads = multer({storage: storage})


//routers user
router.post('/register', registerValidation, UserController.register)
router.post('/login', loginValidation,  UserController.login)
router.get('/current', authentificateToken, UserController.current)
router.get('/users/:id', authentificateToken, UserController.getUserById)
router.put('/users/:id', authentificateToken, uploads.single('avatar'), UserController.updateUser)
//routers posts
router.post('/posts', authentificateToken, uploads.single('imageUrl'), postCreateValidation, PostController.createPost)
router.get('/posts', authentificateToken, PostController.getAllPosts)
router.get('/posts/:id', authentificateToken, PostController.getPostById)
router.delete('/posts/:id', authentificateToken, PostController.deletePost)
//routers comments
router.post('/comments', authentificateToken, commentCreateValidation, CommentController.createComment)
router.delete('/comments/:id', authentificateToken, CommentController.deleteComment)

//routers follow
router.post('/follow', authentificateToken, FollowController.followUser)
router.delete('/unfollow/:id', authentificateToken, FollowController.unFollowUser)

//routers savePost
router.post('/save', authentificateToken, SaveController.savePost)
router.delete('/unsave/:id', authentificateToken, SaveController.deleteSavedPost)



module.exports = router