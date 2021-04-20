import fs from "fs";
import { resolve } from "node:path";

//Adds category and main channel to server
function serverConfig(server, globals) {
    let config = globals["config"];
    if (config[server.id]) {
        if (!server.mainChannel) server.mainChannel = server.channels.cache.get(config[server.id].mainChannel);
        if (!server.categoryId) server.categoryId = server.channels.cache.get(config[server.id].categoryId);
        return true;
    } else {
        console.error(`This server ${server.id} (${server.name}) is not registered`);
        return false;
    }
}

//Goes through the entire mainchannel to update
function checkThrough(messages, server, globals) {
    messages.forEach((msg) => {
        let red = msg.reactions.cache;
        if (red.size > 0) {
            if (!globals["relations"][msg.id]) {
                globals = channelCreator(msg, server, globals);
            }

            let channel = server.channels.cache.find((c) => c.id == globals["relations"][msg.id]);
            if (!(channel && channel != server.mainChannel)) {
                console.error("Error in relations json. Proceeding to overwrite");
                globals = channelCreator(msg, server, globals);
            }
            channel = server.channels.cache.find((c) => c.id == globals["relations"][msg.id]);
            channel.lockPermissions().then(function () {
                let reacc = msg.reactions.cache.forEach((re) => {
                    re.users.fetch().then((item) => {
                        item.forEach((reactor) => channel.updateOverwrite(reactor.id, { VIEW_CHANNEL: true }));
                    });
                });
            });
        }
    });
}

//Creates a channel if none currently exist
async function channelCreator(msg, server, globals) {
    let bot = globals["bot"];
    let category = server.categoryId;
    let creation = await Promise.resolve(
        server.channels
            .create(msg.content.length > 91 ? msg.content.substring(0, 90) : msg.content, {
                type: "text",
                permissionOverwrites: [
                    {
                        id: server.id,
                        deny: ["VIEW_CHANNEL"],
                    },
                    {
                        id: bot.user.id,
                        allow: ["VIEW_CHANNEL"],
                    },
                ],
                parent: category,
            })
            .then((c) => {
                let duplicate = server.channels.cache.find(
                    (channel) => c.id != channel.id && channel.parentID == category.id && c.name == channel.name
                );
                if (duplicate) {
                    c.delete();
                    globals["relations"][msg.id] = duplicate.id;
                } else {
                    globals["relations"][msg.id] = c.id;
                    c.send(
                        `Welcome to this channel. Please use this as a place to talk & prepare activities related to the title of this server.` +
                            `\nDon't be shy. We're all friends here xx.`
                    );
                }
                updateRel(globals);
            })
            .catch(console.error)
    );

    return globals;
}

//Updates the relations
function updateRel(globals) {
    fs.writeFile("./serverConfig/message2channel.json", JSON.stringify(globals["relations"]), function () {
        console.info("Update relations");
    });
}

//Updates entire server: may change for larger servers
function reactionChange(reaction, user, state, globals) {
    let server = reaction.message.guild;
    if (serverConfig(server, globals) === true) {
        if (server.mainChannel == reaction.message.channel) {
            server.mainChannel.messages.fetch().then((m) => checkThrough(m, server, globals));
        }
    }
}

export { serverConfig, checkThrough, channelCreator, updateRel, reactionChange };
