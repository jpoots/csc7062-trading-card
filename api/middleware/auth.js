const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const db = require("../db")

dotenv.config();
const saltRounds = Number(process.env.SALT_ROUNDS);

/* https://www.youtube.com/watch?v=Tw5LupcpKS4 */
const auth = async (req, res, next) => {
    let apiKey = req.header("x-api-key");
    let foundKey = null;

    let getKeysQ = `
    SELECT * FROM api_user`
    
    try {
        let keys = await db.promise().query(getKeysQ, [apiKey]);
        keys = keys[0];
    
        for (let keyInd = 0; keyInd < keys.length; keyInd++) {
            if (await bcrypt.compare(apiKey, keys[keyInd].api_key)){
                foundKey = keys[keyInd];
                break;
            }
        }

        if (foundKey){
            req.admin = foundKey.admin;
            next();
        } else {
            res.json({
                status: 403,
                message: "access denied"
            })
        }
        
    } catch {
               res.json({
            status: 403,
            message: "access denied"
        }) 
    }

}

module.exports = auth;