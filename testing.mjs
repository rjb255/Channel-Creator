import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { serverConfig } from "./cus-functions.mjs";
import Discord from "discord.js";
let config = {};
let relations = {};
const [, , TOKEN, testcategoryId, testmainChannel, bot] = await Promise.resolve([
    (config = JSON.parse(fs.readFileSync("./serverConfig/properties.json", "utf-8"))),
    (relations = JSON.parse(fs.readFileSync("./serverConfig/message2channel.json", "utf-8"))),
    process.env.TOKEN,
    "795967254289973268",
    "795982405260410880",
    new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] }),
]);
let globals = { config, relations, bot };

bot.login(TOKEN);

bot.on("ready", () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.guilds.cache.forEach((server) => {
        console.info(`Loaded on ${server.id} (${server.name}!)`);
        if (serverConfig(server, globals) === true) {
            // server.mainChannel.messages.fetch().then((m) => checkThrough(m, server));
        }
    });
});

bot.on("messageReactionAdd", async (reaction, user) => {
    //reactionChange(reaction, user, 1);
    console.log(reaction);
});

bot.on("messageReactionRemove", async (reaction, user) => {
    //reactionChange(reaction, user, 0);
});

// config.array.forEach((element) => {
//     console.log(element);
// });
// config;
// console.log(config);
