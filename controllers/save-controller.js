const { prisma } = require("../prisma/prisma-client")

const SaveController = {
    savePost: async (req, res) => {
        const { savedPostId } = req.body;
        const userId = req.user.userId;
        if (savedPostId === userId) {
            return res.status(500).json({ err: 'don"t save youself ' })
        }
        try {
            const existingSubScript = await prisma.save.findFirst({
                where: {
                    AND: [
                        { userSavedId: userId },
                        { savedPostId }
                         
                    ]
                }
            })

            if (existingSubScript) {
                return res.status(400).json({ err: 'You alredy saved ' })
            }
          
            await prisma.save.create({
                data: {
                    userSaved: { connect: { id: userId } },
                    savedPost: { connect: { id: savedPostId } },
                }
            })
            res.status(201).json({ message: 'saved succesful' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ err: 'err' })
        }
    },
    deleteSavedPost: async (req, res) => {
        const { savedPostId } = req.body;
        const userId = req.user.userId;
        try {
            const save = await prisma.save.findFirst({
                where: {
                    AND: [
                        { userSavedId: userId },
                        { savedPostId }
                    ]
                }
            })
            if (!save) {
                return res.status(404).json({ err: 'You don"t save' })
            }
            await prisma.save.delete({
                where: { id: save.id }
            })
            res.status(201).json({ message: 'unsave succesful' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ err: 'err' })
        }
    }

}
module.exports = SaveController