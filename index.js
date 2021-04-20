//Imports
import dotenv from "dotenv"; // Securely get env variables
dotenv.config();
import fs from "fs"; // File reading even upon modification
import Discord from "discord.js"; // Discord Specific Stuff
import { serverConfig } from "cus-functions"; // Custom Functions

//Defining characteristics async
let config = {};
let relations = {};
const [, , TOKEN, testcategoryId, testmainChannel, bot] = await Promise.resolve([
    (config = JSON.parse(fs.readFileSync("./serverConfig/properties.json", "utf-8"))),
    (relations = JSON.parse(fs.readFileSync("./serverConfig/message2channgel.json", "utf-8"))),
    process.env.TOKEN,
    "795967254289973268",
    "795982405260410880",
    new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] }),
]);
global = { config, relations };
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

bot.on("message", (msg) => {
    let server = msg.guild;
    if (!serverProperties(server, globals)) break;
    if (msg.content == "restart" && server.mainChannel == testmainChannel) {
        clear(server);
    } else {
        let channel = msg.channel.id;
        if (channel === server.mainChannel.id && msg.author.id != bot.user.id) {
            let category = server.channels.cache.find((c) => c.id == server.categoryId.id && c.type == "category");
            server.channels
                .create(msg.content, {
                    type: "text",
                    permissionOverwrites: [
                        {
                            id: server.id,
                            deny: ["VIEW_CHANNEL"],
                        },
                        {
                            id: msg.author.id,
                            allow: ["VIEW_CHANNEL"],
                        },
                        {
                            id: bot.user.id,
                            allow: ["VIEW_CHANNEL"],
                        },
                    ],
                    parent: category,
                })
                .then((c) => channelCreated(c, msg, category))
                .catch(console.error);

            const filter = (reaction, user) => {
                return reaction.emoji.name;
            };

            const collector = msg.createReactionCollector(filter);
            collector.on("collect", function (collected) {
                let users = collected.users.cache;
                let destinedChannel = server.channels.cache.find(
                    (c) => c.name == msg.content && c.type == "text" && c.parentID == server.categoryId.id
                );
                for (user of users) {
                    console.log(collected);
                    destinedChannel.updateOverwrite(user[0], { VIEW_CHANNEL: true });
                }
            });
        }
    }
});

function channelCreated(channel, msg, category) {
    let duplicate = channel.guild.channels.cache.find(
        (c) => c.id != channel.id && c.parentID == category.id && c.name == channel.name
    );
    if (duplicate.size) {
        channel.delete();
    } else {
        msg.channel
            .send(`Welcome to this server. Please use this as a place to talk & prepare activities related to the title of this server.
Don't be shy. We are all friends here xx.`);
    }
}

async function clear(server) {
    for (c of server.channels.cache) {
        let ch = server.channels.cache.get(c[0]);
        if (ch.parentID == server.categoryId.id && ch.id != server.mainChannel && ch.type == "text") {
            ch.delete();
        }
    }
    var msg_size = 100;
    while (msg_size == 100) {
        await server.mainChannel
            .bulkDelete(100)
            .then((messages) => (msg_size = messages.size))
            .catch(console.error);
    }
}

bot.on("messageReactionAdd", async (reaction, user) => {
    reactionChange(reaction, user, 1);
});

bot.on("messageReactionRemove", async (reaction, user) => {
    reactionChange(reaction, user, 0);
});
