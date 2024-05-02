const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const db = require("./db");
const crypto = require("crypto");

dotenv.config();

const saltRounds = Number(process.env.SALT_ROUNDS);

const generate = async () => {
    let priv = process.argv.slice(2)[0];

    if (priv == 1 || priv == 0) {
        // https://stackoverflow.com/questions/63920296/generate-unique-api-keys-for-user-in-node-js-application-for-access-to-your-apis
        const apiKey = crypto.randomUUID();
        const hashedKey = await bcrypt.hash(apiKey, saltRounds);
        const admin = priv == 1 ? true : false; 

        const insertQ = `
        INSERT INTO api_user (api_key, admin) VALUES (?, ?)`
        let result = await db.promise().query(insertQ, [hashedKey, admin])
        console.log(`Your API key is ${apiKey}`)
        console.log(`Keep it safe and do not share with others. You will not be able to access it again.`);
    } else {
        console.log("Invalid details. Please enter 1 or 0")
    }
}

generate();


