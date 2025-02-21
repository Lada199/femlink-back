const { prisma } = require("../prisma/prisma-client")

const FollowController = {
    followUser: async (req, res) => {
        const { followingId } = req.body;
        const userId = req.user.userId;
        if (followingId === userId) {
            return res.status(500).json({ err: 'don"t following youself ' })
        }
        try {
            const existingSubScript = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerId: userId },
                        { followingId }
                    ]
                }
            })

            if (existingSubScript) {
                return res.status(400).json({ err: 'You alredy following ' })
            }
            await prisma.follows.create({
                data: {
                    follower: { connect: { id: userId } },
                    following: { connect: { id: followingId } },
                }
            })
            res.status(201).json({ message: 'following succesful' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ err: 'err' })
        }
    },
    unFollowUser: async (req, res) => {
        const { followingId } = req.body;
        const userId = req.user.userId;
        try {
            const follows = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerId: userId },
                        { followingId }
                    ]
                }
            })
            if (!follows) {
                return res.status(404).json({ err: 'You don"t follow' })
            }
            await prisma.follows.delete({
                where: { id: follows.id }
            })
            res.status(201).json({ message: 'unfollowing succesful' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ err: 'err' })
        }
    }

}
module.exports = FollowController