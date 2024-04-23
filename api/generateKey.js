const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const db = require("./db");
const crypto = require("crypto");

dotenv.config();

const saltRounds = Number(process.env.SALT_ROUNDS);

/* https://www.youtube.com/watch?v=Tw5LupcpKS4 */
(async () => {
    
    // https://stackoverflow.com/questions/63920296/generate-unique-api-keys-for-user-in-node-js-application-for-access-to-your-apis
    const apiKey = crypto.randomUUID();
    const hashedKey = await bcrypt.hash(apiKey, saltRounds);
    const admin = true; 

    const insertQ = `
    INSERT INTO api_user (api_key, admin) VALUES (?, ?)`
    let result = await db.promise().query(insertQ, [hashedKey, admin])

    console.log(`Your API key is ${apiKey}`)
    console.log(`This key has admin privileges`)
    console.log(`Keep it safe and do not share with others. You will not be able to access it again.`);
})();


