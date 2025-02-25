const { prisma } = require("../prisma/prisma-client")
const bcrypt = require("bcryptjs");
const fs = require("fs");
const Jdenticon = require("jdenticon")
const path = require('path');
const jwt = require('jsonwebtoken')


const UserController = {
    register: async (req, res) => {
        const { email, password, fullName } = req.body
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'All fields requared' })
        }
        try {
            const existingUser = await prisma.user.findUnique(({ where: { email } }));

            if (existingUser) {
                return res.status(400).json({ error: 'User already exists.' })
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            let avatarName = 'default-avatar.png';

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    fullName,
                    avatarUrl: `/uploads/${avatarName}`
                }
            })
            res.json(user)

        } catch (error) {
            console.log('error in register', error)
            res.status(500).json({
                error: "error in register"
            })

        }

    },
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ err: 'All fields requared' })
        }
        try {

            const user = await prisma.user.findUnique({ where: { email } })
            if (!user) {
                return res.status(400).json({ error: 'Incorrect password or email.' })
            }


            const valid = await bcrypt.compare(password, user.password)
            if (!valid) {
                return res.status(400).json({ error: 'Incorrect password or email.' })
            }

            const token = jwt.sign(({ userId: user.id }), process.env.SECRET_KEY)

            res.json({ token })

        } catch (error) {
            console.error('login error', error)
            res.status(500).json({ error: 'err' })

        }
    },
  
    updateUser: async (req, res) => {
        const { id } = req.params
        const { email, name, dateOfBirth, bio, location, avatarUrl } = req.body

        let filePath

        if (req.file && req.file.path) {
            filePath = req.file.path
        }
        if (id !== req.user.userId) {
            return res.status(403).json({ err: 'Access denied.' })
        }
        try {
            if (email) {
                const existingUser = await prisma.user.findFirst({ where: { email } })
                if (existingUser && existingUser.id !== id) {
                    return res.status(400).json({ err: "This email is already registered." })
                }
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    email: email || undefined,
                    name: name || undefined,
                    avatarUrl: filePath ? `/${filePath}` : undefined,
                    dateOfBirth: dateOfBirth || undefined,
                    bio: bio || undefined,
                    location: location || undefined

                }
            })

            res.json(user)

        } catch (error) {
            console.error('Get current Error', error)

        }
    },
    getUserById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id
                },
                include: {
                    posts: {
                        include: {
                            comments: true,
                            author: true,
                            followers: true,
                            savedBy:true,
                        }

                    },
                    // savedPost:{
                    //     include: {
                    //         savedPost: true,
                    //     }
                    // },
                    savedPost: {
                        include: {
                            savedPost: {
                                include: {
                                    savedBy: true, 
                                    author: true,
                                    comments: true, 
                                }
                            }
                        }
                    },
                    following: {
                        include: {
                            following:{
                                include: {
                                    savedBy: true, 
                                    author: true,
                                    comments: true, 
                                }
                            }
                            
                        }
                    }



                }
            })

            if (!user) {
                return res.status(404).json({ err: 'User not found' })
            }


            res.json({ ...user, })
        } catch (error) {
            console.error('Get current Error', error)
            res.status(500).json({ error: 'err' })

        }

    },
   
    current: async (req, res) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                
                include: {
                    posts: true,
                   
                    following: {
                        include: {
                            following: true
                        }
                    },
                    // savedPost:{
                    //     include: {
                    //         savedPost: true,
                          
                    //     }
                    // },
                    
                   
                   


                }
            })

            if (!user) {
                return res.status(400).json({ error: 'User not found.' })
            }
           
            
            res.json(user)

        } catch (error) {
            console.error('Get current Error', error)
        }
    },
}

module.exports = UserController