//active le mode stricte de JS et détécter les erreurs courantes et interdire les syntaxes non sécurisés
'use strict'

const {z} = require('zod')

const registerSchema = z.object({
    pseudo: z.string().min(2, {error: "pseudo must have at least 2 characters"}).max(50, {error: "pseudo must have less than 50 characters"}).trim(),
    email: z.email({error: "email must be valid"}).trim().toLowerCase(),
    password: z.string().min(6, {error: "password must have at least 6 characters"}).regex(/[A-Z]/, {error: "password must have at least 1 capital letter"}).regex(/[0-9]/, {error: "password must have at least 1 number"}).regex(/[^a-zA-Z0-9]/, {error: "password must have at least 1 special character"})
}).strict() //interdit tout champs supplémentaire non défini pour éviter le mass assignement (injection non désiré)

const loginSchema = z.object({
    email: z.email({error: "email must be valid"}).trim().toLowerCase(),
    password: z.string().min(6, {error: "password must have at least 6 characters"}).regex(/[A-Z]/, {error: "password must have at least 1 capital letter"}).regex(/[0-9]/, {error: "password must have at least 1 number"}).regex(/[^a-zA-Z0-9]/, {error: "password must have at least 1 special character"})
}).strict()


// const loginSchema = z.object({
//     identifiant: z.string()
//         .trim()
//         .min(3, {error: "L'identifiant doit contenir au moins 3 caractères"})
//         .refine(
//             value => validator.isEmail(value || /^[a-zA-Z0-9_-]+$/.test(value),
//             {error: "Veuillez saisir un email ou un pseudo valide"})
//         ),
//     password: z.string()
//         .min(6, { error: "Le mot de passe doit contenir au moins 6 caractères"})
//         .regex(/[A-Z]/, { error: "Au moins une majuscule est requise"})
//         .regex(/[0-9]/, { error: "Au moins un chiffre est requis"})
//         .regex(/[^a-zA-Z0-9]/, { error: "Au moins un caractère spécial est requis"})
// }).strict() si comme le collègue on a un champs identifiant qui fait mail ou pseudo

module.exports = { registerSchema, loginSchema }