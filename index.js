//Imports
import dotenv from "dotenv"; // Securely get env variables
import fs from "fs"; // File reading even upon modification
import Discord from "discord.js"; // Discord Specific Stuff
import { serverConfig, checkThrough, reactionChange } from "./cus-functions.mjs"; // Custom Functions
dotenv.config();

//Defining characteristics async
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

//Update the server after a hiatus
bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.guilds.cache.forEach((server) => {
        console.info(`Loaded on ${server.id} (${server.name}!)`);
        if (serverConfig(server, globals) === true) {
            server.mainChannel.messages.fetch().then((m) => checkThrough(m, server, globals));
        }
    });
});

//When a message is reacted/unreacted, update the channels
bot.on("messageReactionAdd", async (reaction, user) => {
    reactionChange(reaction, user, 1, globals);
});
bot.on("messageReactionRemove", async (reaction, user) => {
    reactionChange(reaction, user, 0, globals);
});
