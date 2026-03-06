import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'
import {PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const loginUser = [
    body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("First name must contain only letters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Last name must contain only letters"),
  body("email")
    .trim()
    .isEmail()
    .endsWith("@nith.ac.in")
    .withMessage("Valid college email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }
    
       const { firstName, lastName, email, password } = req.body;

       if(!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
       }

       try {
            const user = await prisma.user.findUnique({ where: { email } })
            if(!user) {
                return res.status(401).json({ error: "Invalid email or password" })
            }
            if (!user.isVerified) return res.status(401).json({ error: "Please verify your email first" });
            
            if(user.firstName !== firstName || user.lastName !== lastName) {
                return res.status(401).json({ error: "Invalid email or password" })
            }



        }catch(err){
            console.error(err)
            return res.status(500).json({ error: "Server error" })
        }
    }
]