const { prisma } = require("../prisma/prisma-client")

const CommentController = {
    createComment: async (req, res) => {
        const {postId, content} = req.body;
        const userId = req.user.userId;
        if(!postId || !content){
            return res.status(400).json({err: 'all fields requares'})

        }
        try{
            const comment = await prisma.comment.create({
                data: {postId, userId, content},

            })
            res.json(comment)
        }catch(err){
            console.log(err, 'createe post error')

            res.status(500).json({err: 'error'})

        }
    },
    
    deleteComment: async (req, res) => {
        const {id} = req.params;
        const userId = req.user.userId
        try{
            const comment = await prisma.comment.findUnique({
                where: {id}
            })
            if(!comment){
                return res.status(404).json({err: 'comment not found'})
            }
            if(comment.userId !== userId){
                return res.status(403).json({err: 'comment not enter'})
            }

             await prisma.comment.delete({where: {id}}) 
             res.json(comment)

        }catch(err){
            console.log(err, 'delete post error')

            res.status(500).json({err: 'error'})
        }
    }

}
module.exports = CommentController