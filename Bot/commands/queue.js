const queue = new Map();
exports.run = async (client, message, args) => {
	const playQueue = require('./play');
	const ytdl = require('ytdl-core');
	const Discord = require('discord.js');
	const embed = new Discord.MessageEmbed();
	const currentQueue = await playQueue.getQueue();
	let count = 1;
	console.log(currentQueue);
	if(!currentQueue) return message.author.send("There is currently no queue");
	embed.setTitle("Current Queue - ");
	embed.setColor('#8b679e');
	embed.setThumbnail(await message.guild.iconURL);
	currentQueue.get(message.guild.id).songs.forEach(song => {
		console.log(song);
		if(count == 10) return;
		embed.addFields({ name: `${song.title}`, value: `**${song.url}**`});
		count+=1;
	});
	message.channel.send(embed);
}

module.exports.help = {
	name: "Music Queue",
	type: "fun",
	aliases: ["q"],
	desc: "Displays the current queue for the server. It will only show the next 10 songs on the list.",
	usage: "!!queue",
	gif: "https://cdn.discordapp.com/attachments/820346508263424000/820348011296194570/2021-03-13_12-24-00.gif"
}