const schedule = require('node-schedule');
const { prisma } = require("../prisma/prisma-client")


const PostController = {
    createPost: async (req, res) => {
        const { content, location, title, dateOfStart, city, places } = req.body
        const authorId = req.user.userId;

        let filePath
        if (req.file && req.file.path) {
            filePath = req.file.path
        }


        const imageUrl = filePath ? `/${filePath}` : null;


        try {
            const formattedDate = new Date(dateOfStart);
            if (isNaN(formattedDate.getTime())) {
                return res.status(400).json({ err: 'Invalid date format' });
            }

            const placesInt = parseInt(places, 10);
            if (isNaN(placesInt)) {
                return res.status(400).json({ err: 'Invalid value for places. Must be a number.' });
            }

            if (!authorId) {
                throw new Error('Author is required');
            }

            const post = await prisma.post.create({
                data: {
                    content,
                    authorId,
                    imageUrl,
                    location,
                    title,
                    dateOfStart: formattedDate,
                    city,
                    places: placesInt

                }
            })

            schedule.scheduleJob(formattedDate, async () => {
                try {
                    await prisma.post.delete({
                        where: { id: post.id }
                    });
                    console.log(`Post with ID ${post.id} has been deleted`);
                } catch (err) {
                    console.error(`Failed to delete post with ID ${post.id}:`, err);
                }
            });


            res.json(post)
        } catch (err) {
            console.log(err, 'Create post error')
            res.status(500).json({ err: 'Create post error' })

        }

    },
    getAllPosts: async (req, res) => {
        const userId = req.user.userId
        try {
            const posts = await prisma.post.findMany({
                include: {

                    author: true,
                    comments: true,
                    followers: {
                        include: {
                            follower: true,

                        }
                    },

                    savedBy: {
                        include: {
                            userSaved: true,

                        }

                    }


                },
                orderBy: {
                    createdAt: 'desc'
                }
            })



            const postsWithLikeInfo = await Promise.all(
                posts.map(async (post) => {
                    const isSavedPost = await prisma.save.findFirst({
                        where: {
                            AND: [
                                { userSavedId: userId },
                                { savedPostId: post.id }
                            ]
                        }
                    });

                    return {
                        ...post,
                        isSavedPost: Boolean(isSavedPost)
                    };
                })
            );




            res.json(postsWithLikeInfo)
        } catch (err) {
            console.log(err, 'gat all posts error')

            res.status(500).json({ err: 'error' })

        }
    },
    getPostById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId

        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    comments: {
                        include: {
                            user: true

                        }
                    },

                    savedBy: {
                        include: {
                            userSaved: true,

                        }

                    },
                    followers: {
                        include: {
                            follower: true

                        }
                    },

                    author: true
                }
            })
            if (!post) {
                return res.status(404).json({ err: 'post not found' })
            }
            const isFollowing = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {
                            followerId: userId
                        },
                        {
                            followingId: id
                        }
                    ]
                }
            })
            const isSavedPost = await prisma.save.findFirst({
                where: {
                    AND: [
                        {
                            userSavedId: userId
                        },
                        {
                            savedPostId: id
                        }
                    ]
                }
            })

            res.json({ ...post, isFollowing: Boolean(isFollowing), isSavedPost: Boolean(isSavedPost) })
        } catch (err) {
            console.log(err, 'gat  posts by id error')

            res.status(500).json({ err: 'error' })
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params

        const post = await prisma.post.findUnique({
            where: {
                id
            }
        })
        if (!post) {
            return res.status(404).json({ err: ' post not found' })
        }
        if (post.authorId !== req.user.userId) {
            return res.status(403).json({ err: 'Access denied.' })
        }
        try {
            const transaction = await prisma.$transaction([
                prisma.comment.deleteMany({ where: { postId: id } }),
                prisma.follows.deleteMany({
                    where: {
                        OR: [
                            { followerId: id },
                            { followingId: id }
                        ]
                    }
                }),
                prisma.save.deleteMany({
                    where: {
                        OR: [
                            { userSavedId: id },
                            { savedPostId: id }
                        ]
                    }
                }),

                prisma.post.delete({ where: { id } })
            ])
            res.json(transaction)
        } catch (err) {
            console.log(err, 'delete post error')

            res.status(500).json({ err: 'error' })
        }
    }
}

module.exports = PostController