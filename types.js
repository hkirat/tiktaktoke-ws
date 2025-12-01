
const z = require("zod")

const SignupSchema = z.object({
    username: z.string().min(3).max(200),
    password: z.string()
});


const SigninSchema = z.object({
    username: z.string().min(3).max(200),
    password: z.string()
});

module.exports = {
    SignupSchema: SignupSchema,
    SigninSchema: SigninSchema
}