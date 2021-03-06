//God Help Me I am Too Lazy to pass these so they are global vars.s

const queue = new Map();
const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

var ytpl = require('ytpl');
exports.run = async (client, message, args) => {
	const embed = new Discord.MessageEmbed();
	const vc = message.member.voice.channel;
	if(!vc) return message.author.send("Not in a VC");
	if(!args.length) return message.channel.send("Please send a link to the video");
	let song = {};
	let playlist = false;


	if(args[0].match(/https??:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
		let playList = await ytpl(args[0]);
		playlist = true;
		playList.items.forEach(async item => {
			song = {
				title: item.title,
				url: item.url,
				thumbnail: item.thumbnails[0].url
			}
			await createQueue(vc, song, embed, message, playlist);
		});	
	} else if(ytdl.validateURL(args[0])) {
		const info = await ytdl.getInfo(args[0]);
		song = {
			title: info.videoDetails.title,
			url: info.videoDetails.video_url,
			thumbnail: info.videoDetails.thumbnails[0].url
		}
		await createQueue(vc, song, embed, message, playlist);
	} else {
		const videoResult = await ytSearch(args.join(' '));
		if(videoResult) {
			song = {
				title: videoResult.videos[0].title, 
				url: videoResult.videos[0].url,
				thumbnail: videoResult.videos[0].thumbnail
			}
		}
		await createQueue(vc, song, embed, message, playlist);
	}
	

}

const createQueue = async (vc, song, embed, message, playlist) => {
	const servQueue = queue.get(message.guild.id);
	if(!servQueue) {
		const queueBase = {
			voice_channel: vc,
			connection: null,
			songs: [],
			skipVotes: 0
		}
		queue.set(message.guild.id, queueBase);
		queueBase.songs.push(song);
		embed.setTitle(`Now Playing:`);
		embed.setDescription(song.title);
		embed.setThumbnail(song.thumbnail);
		embed.setColor('#7d3878');
		message.channel.send(embed);
		try {
			const connection = await vc.join();
			queueBase.connection = connection;
			this.player(message, queueBase.songs[0], ytdl);
		} catch(err) {
			queue.delete(message.guild.id);
			message.channel.send("Cant Connect");
			throw err;
		}
	} else {
		if(!servQueue.voice_channel) {
			const connection = await vc.join();
			servQueue.connection = connection;
			servQueue.voice_channel = vc;
			this.player(message, servQueue.songs[0], ytdl);
		}
		servQueue.songs.push(song);
		if(!playlist) {
			embed.setTitle(`Added to Queue:`);
			embed.setDescription(song.title);
			embed.setThumbnail(song.thumbnail);
			embed.setColor('#7d3878');
			message.channel.send(embed);
		}
	}
}

exports.player = async(message, song, ytdl) => {
	const skipEmbed = new Discord.MessageEmbed();
	const songqueue = queue.get(message.guild.id);

	if(!song) {
		skipEmbed.setTitle("Queue Finished. Now Leaving");
		skipEmbed.setColor('#7d3878');
		skipEmbed.setThumbnail('http://simpleicon.com/wp-content/uploads/music-note-1.png');
		message.channel.send(skipEmbed);
		songqueue.voice_channel.leave();
		queue.delete(message.guild.id);
		return;
	} else {
		const stream = ytdl(song.url, {filter: 'audioonly' });
			songqueue.connection.play(stream, { seek: 0, volume: 1}).on('finish', () => {
			songqueue.songs.shift();
			if(songqueue.songs[0]) {
				skipEmbed.setTitle(`Next In Line --- ${songqueue.songs[0].title}`);
				skipEmbed.setThumbnail(songqueue.songs[0].thumbnail);
				skipEmbed.setColor('#7d3878');
				message.channel.send(skipEmbed);
			}
			this.player(message, songqueue.songs[0], ytdl);
		})
	}

}

exports.getQueue = () => {
	return queue;
}

module.exports.help = {
	name: "Play Music",
	type: "fun",
	aliases: ["p"],
	desc: "YES! Watchcat can even play music in your server. At the minute, watchcat can search all of YouTube to find the perfect audio just for you! To do this, type !!play (link or search query) to start playing your song.",
	usage: "!!play (link or search query)",
	gif: "https://cdn.discordapp.com/attachments/820346508263424000/820348255502204998/2021-03-13_12-22-27_1.gif"
}