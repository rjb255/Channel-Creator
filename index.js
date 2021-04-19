require('dotenv').config();
const config = require('./serverConfig/properties.js');
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const testcategoryId = "795967254289973268";
const testmainChannel = "795982405260410880";
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  bot.guilds.cache.forEach(server => update(server));
});

bot.on('message', msg => {
	let server = msg.guild;
	config.serverProperties(server);
	if (msg.content == "restart"){
		clear(server);
	} else {
		let channel = msg.channel.id;
		console.info(`In channel id ${channel}`);
		
		if (channel === server.mainChannel.id && msg.author.id != bot.user.id){
			let category = server.channels.cache.find(c => c.id == server.categoryId.id && c.type == "category");
			
			server.channels.create(msg.content,{
				type: 'text',
				permissionOverwrites: [
					{
						id: server.id,
						deny: ['VIEW_CHANNEL'],
					},
					{
						id: msg.author.id,
						allow: ['VIEW_CHANNEL'],
					},
					{
						id: bot.user.id,
						allow: ['VIEW_CHANNEL'],
					},
				],
				parent: category,
			})
				.then(c => channelCreated(c, msg, category))
				.catch(console.error);

			const filter = (reaction, user) => {
				return reaction.emoji.name;
			};

			const collector = msg.createReactionCollector(filter);
			collector.on('collect', function(collected) {
				let users = collected.users.cache;
				let destinedChannel = server.channels.cache.find(c => c.name == msg.content && c.type == "text" && c.parentID == server.categoryId.id);
				for (user of users) {
					console.log(collected);
					destinedChannel.updateOverwrite(user[0], {VIEW_CHANNEL: true});
					
				}
			});
		}
	}
});


function channelCreated(channel, msg, category){
	msg.delete();
	let duplicate = channel.guild.channels.cache.find(c => c.id != channel.id && c.parentID == category.id && c.name == channel.name);
	if (duplicate){
		channel.delete();
	} else {
		msg.channel.send(channel.name);
	}
}

async function clear(server) {
	for (c of server.channels.cache) {
		let ch = server.channels.cache.get(c[0]);
		if (ch.parentID == server.categoryId.id && ch.id != server.mainChannel && ch.type == "text"){
			ch.delete();
		}
	}
	var msg_size = 100;
	while (msg_size == 100) {
		await server.mainChannel.bulkDelete(100)
			.then(messages => msg_size = messages.size)
			.catch(console.error);
	}
}

function update(server){
	config.serverProperties(server);
	server.mainChannel.messages.fetch()
		.then(m => checkThrough(m, server));
}

function checkThrough(messages, server){
	messages.forEach(msg => {
		let channel = server.channels.cache.find(c => c.parentID == server.categoryId.id && c.name == msg.content);
		if (channel){
			channel.lockPermissions()
				.then(function(){
					let red = msg.reactions.cache.users.fetch()
										.then(users => reaction.cache.map((item) => item.users.cache.array()));
					red.forEach(r => channel.updateOverwrite(r.id, {VIEW_CHANNEL: true}));
				});

		}
	});
}