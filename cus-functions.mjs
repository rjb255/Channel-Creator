import fs from "fs";

function serverConfig(server, globals) {
    config = globals[config];
    if (config[server.id]) {
        if (!server.mainChannel) server.mainChannel = server.channels.cache.get(config[server.id].mainChannel);
        if (!server.categoryId) server.categoryId = server.channels.cache.get(config[server.id].categoryId);
        return true;
    } else {
        console.error(`This server ${server.id} (${server.name}) is not registered`);
        return false;
    }
}

function checkThrough(messages, server, globals) {
    messages.forEach((msg) => {
        if (globals["relations"][msg.id]) {
            let channel = server.channels.cache.find((c) => c.id == msg.globals["relations"][msg.id]);
            if (channel) {
                channel.lockPermissions().then(function () {
                    let red = msg.reactions.cache.users
                        .fetch()
                        .then(() => reaction.cache.map((item) => item.users.cache.array()));
                    red.forEach((r) => channel.updateOverwrite(r.id, { VIEW_CHANNEL: true }));
                });
            } else {
                console.error("Error in relations json");
            }
        } else {
            let red = msg.reactions.cache.users;
            if (red.cache.size > 0) {
                channelCreator(msg, server, globals);
            }
        }
    });
}

function channelCreator(msg, server, globals) {
    let bot = globals["bot"];
    let category = server.categoryId;
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
        .then((c) => {
            let duplicate = c.guild.channels.cache.find(
                (channel) => c.id != channel.id && channel.parentID == category.id && c.name == channel.name
            );
            if (duplicate) {
                c.delete();
                globals["relations"][msg.id] = duplicate.id;
            } else {
                globals["relations"][msg.id] = c.id;
                c.send(
                    `Welcome to this server. Please use this as a place to talk & prepare activities related to the title of this server.` +
                        `Don't be shy. We are all friends here xx.`
                );
            }
            updateRel(globals);
        })
        .catch(console.error);
}

function updateRel(globals) {
    fs.writeFile("./serverConfig/message2channel.json", globals["relations"]);
}

function reactionChange(reaction, user, state, globals) {
    if (serverConfig(server, config, globals) === true) {
        server.mainChannel.messages.fetch().then((m) => checkThrough(m, server, globals));
    }
}

export { serverConfig, checkThrough, channelCreator, updateRel, reactionChange };
