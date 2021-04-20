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
        let channel = server.channels.cache.find((c) => c.parentID == server.categoryId.id && c.name == msg.content);
        if (channel) {
            channel.lockPermissions().then(function () {
                let red = msg.reactions.cache.users
                    .fetch()
                    .then(() => reaction.cache.map((item) => item.users.cache.array()));
                red.forEach((r) => channel.updateOverwrite(r.id, { VIEW_CHANNEL: true }));
            });
        } else {
            let red = msg.reactions.cache.users;
            if (red.cache.size > 0) {
            }
        }
    });
}

function reactionChange(reaction, user, state, globals) {
    if (serverConfig(server, config) === true) {
        server.mainChannel.messages.fetch().then((m) => checkThrough(m, server));
    }
}

export { serverConfig };
