//middleware générique de validation zod

function validateBody(schema){
    return (req, res, next) =>{
        const result = schema.safeParse(req.body)
        if(!result.sucess){
            return res.status(422).json({
                title: "invalid datas",
                status: 422,
                invalidParams: result.error.issues.map(err =>({
                    path: err.path.join("."),
                    message: err.message
                }))
            })
        }
        //validation ok, renvoi les données sur body et next
        req.body.result.data
        next()
    }
}
module.exports = validateBody