import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

import Client from "discord.js";

let config = {};
const [, TOKEN, testcategoryId, testmainChannel] = await Promise.allSettled([
    fs.readFile("./serverConfig/properties.json", "utf-8", (err, data) => {
        if (err) console.error(err);
        config = JSON.parse(data);
    }),
    process.env.TOKEN,
    "795967254289973268",
    "795982405260410880",
]);
console.log(testcategoryId);
// config;
// console.log(config);
