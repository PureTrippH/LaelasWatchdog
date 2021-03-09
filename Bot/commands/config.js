exports.run = async (client, message) => {
	const filter = m => m.author.id === message.author.id;
	//Library Modules
	const ms = require("ms");
	const mongoose = require('mongoose');
	const serverConfig = require("../utils/schemas/serverconfig.js");
	
	//File Paths & Queries
	const query = require('../utils/queries/queries');
	const thisServer = await query.queryServerConfig(message.guild.id);
	const Discord = require('discord.js');

	//Variable Delcaration
	let embed = new Discord.MessageEmbed();

	if(message.member.hasPermission('ADMINISTRATOR') || message.author.id == '168695206575734784') {
		embed.setTitle("Watchcat Config");
		embed.setDescription("React to Emoji to Edit Config");
		embed.setColor("#98ddfc");
		embed.setThumbnail("https://lh3.googleusercontent.com/proxy/R-TqrLJjqTw4Skfirjskk-KZEEft6tsUHe9l1atC8KoIbEIu5XgLNtweALGLe_oRZcB4yJPdnQVhahvJAnLDAjElQmmiNX4");
		embed.setTimestamp(new Date());
		embed.addFields(
			{ name: `1️⃣ Unverifed Role:`, value: `<@&${thisServer.removedRole}>`, inline: false },
			{ name: `2️⃣ Verification Channel:`, value: `<#${thisServer.verChannel}>`, inline: false },
			{ name: `3️⃣ New User Role:`, value: `<@&${thisServer.newUserRole}>`, inline: false },
			{ name: `4️⃣ Create Tier:`, value: `Create A Punishment Tier Which Scales based on Offense Number`, inline: false },
			{ name: `5️⃣ Edit Tier:`, value: `Click 5 to Edit Tier`, inline: false },
			{ name: `6️⃣ Muted Role:`, value: `<@&${thisServer.mutedRole}>`, inline: false },
			{ name: `7️⃣ Restricted Role :`, value: `<@&${thisServer.mutedRole}>`, inline: false },
		  )
		 message.channel.send(embed).then(msg => {
			msg.react('1️⃣');
			msg.react('2️⃣');
			msg.react('3️⃣');
			msg.react('4️⃣');
			msg.react('5️⃣');
			msg.react('6️⃣');
			msg.react('7️⃣');
			msg.react('❗');
			msg.react('📜');
		
			msg.awaitReactions((reaction, user) => user.id == message.author.id, { max: 1 }).then(async collected => {
				let reaction = collected.first().emoji.name;
				console.log(thisServer);
				switch(reaction) {
					case '1️⃣':
						message.channel.send("Send a Role or role id");
						const role = await collectMsg(message, 1);
						let newrole = await message.guild.roles.cache.get(role.replace('<@&', '').replace('>', ""));
						if(!newrole) {
							message.channel.send("No Role Found!");
						} else {
							await thisServer.updateOne({
								removedRole: newrole.id
							});	
						}
					break;
					case '2️⃣':
						message.channel.send("Please send a Channel");
						let newText = (await collectMsg(message, 1))
						if(!message.guild.channels.cache.get(newText.replace('<#', '').replace('>', ""))) {
							message.channel.send("No Channel Found!");
						} else {
			
							await thisServer.updateOne({
								verChannel: newText.replace('<#', '').replace('>', "")
							});
						}
					break;
	
					case '3️⃣':
						message.channel.send("Please send a Role for New Users");
						let newTextTwo = await collectMsg(message, 1);
						let newNewRole = message.guild.roles.cache.get(newTextTwo.replace('<@&', '').replace('>', ""));
						if(!newNewRole) {
							message.channel.send("No Role Found!");
						} else {
							await thisServer.updateOne({
								newUserRole: newNewRole.id
							});	
						}
					break;
	
					case '4️⃣':
						message.channel.send("Tier Maker: Enter in the Name of Your Tier (NOTE! The Mod Will Type this Broad Name to activate its tiers. ALSO NO SPACES!");
						let tierName = await collectMsg(message, 1);
						message.channel.send(`${tierName.first().content}: Enter in the T1 Punishment time (Example: 1s = 1 second)`);
						let tierTime = await collectMsg(message, 1);
						message.channel.send(`${tierName.first().content}: Enter in the T1 Punishment Forgiveness message count. (Example: User loses a tier after sending 1000 msges)`);
						let forgiveness = await collectMsg(message, 1);
						message.channel.send(`${tierName.first().content}: Send Your Punishment type (Warning, Mute, or Ban).`);
						let punishType = await collectMsg(message, 1);
						if(punishType.first().content.toLowerCase() == "warning" || punishType.first().content.toLowerCase() ==  "ban" || punishType.first().content.toLowerCase() ==  "mute") {
							await thisServer.findOneAndUpdate(
								{
									guildId: message.guild.id
								}, 
									{
									$addToSet: {
										serverTiers: {
										TierName: tierName.toLowerCase(),
										TierForgiveness: forgiveness,
										TierTimes: [ms(time)],
										banOrMute: [punishType.toLowerCase()]
										}
									}
								}).exec()
							message.channel.send("Successfully created tier");
						
						} else return message.channel.send("Punishment does not exist. Try using Mute, Warning, or Ban");
					break;
	
					case '5️⃣':
						message.channel.send("Tier Editor: Enter the Key Name of the Tier (Ex: IrrImg)");
						let tierID = await collectMsg(message, 1);
						if(dbRes.serverTiers.findIndex(tier => tier.TierName === tierID.first().content.toLowerCase()) === -1) return message.channel.send("Tier Not Found! Try Again");
						let tier = dbRes.serverTiers[dbRes.serverTiers.findIndex(tier => tier.TierName === tierID.toLowerCase())];
						message.channel.send(`${tier.TierName}: Please Enter the Next Tier Time You Want to Add (T${dbRes.serverTiers.findIndex(tier => tier.TierName === tierID.first().content) - 1}) (Enter Delete to Delete Last Tier)`);
						let tierNew = await collectMsg(message, 1);
						if(tierNew.first().content.toLowerCase() == 'delete') {
							await thisServer.updateOne(
								{
									guildId: message.guild.id, 
									"serverTiers.TierName": tierID
								}, 
								{
									$pop: {
										"serverTiers.$.TierTimes":  -1
								}
							}).exec();
	
							message.channel.send("Latest Tier Removed!");
							return;
						} else {
	
						if(!ms(tierNew)) return message.channel.send("No Time was Specified");
						let newEntry = ms(tierNew);
						message.channel.send(`Send Your Punishment type for next tier.`);
						if(punishType.toLowerCase() == "warning" || punishType.toLowerCase() ==  "ban" || punishType.toLowerCase() ==  "mute") {
							await thisServer.updateOne({
									guildId: message.guild.id, 
									"serverTiers.TierName": tierID.first().content
								}, 
								{
								$push: {
									"serverTiers.$.banOrMute": punishType.toLowerCase(),
									"serverTiers.$.TierTimes": newEntry
								}
							}).exec();
	
				message.channel.send("Successfully edited tier");
						} else return message.channel.send("Punishment does not exist. Try using Mute, Warning, or Ban");
					}
					break;
	
					case '📜':
						message.channel.send("Please send a Channel");
						let newLog = (await collectMsg(message), 1)
						if(!message.guild.channels.cache.get(newLog.content.replace('<#', '').replace('>', ""))) {
							message.channel.send("No Channel Found!");
						} else {
			
							await thisServer.updateOne({
								logChannel: newLog
							});
						}
					break;
	
					case '6️⃣':
						message.channel.send("Please send Your Server's Muted Role");
						let mutedRole = await collectMsg(message, 1);
						let newMutedRole = message.guild.roles.cache.get(mutedRole.replace('<@&', '').replace('>', ""));
						if(!newrole) {
							message.channel.send("No Role Found!");
						} else {
						await thisServer.updateOne({
							mutedRole: newMutedRole.id
						});	
						}
					break;
	
					case '7️⃣':
						message.channel.send("Please send a Role");
						let restRole = await collectMsg(message, 1);
						let newRestRole = message.guild.roles.cache.get(restRole.replace('<@&', '').replace('>', ""));
						if(!newrole) {
							message.channel.send("No Role Found!");
						} else {
						await thisServer.updateOne({
							mutedRole: newRestRole.id
						});	
						}
					break;
	
				}
				return this.run(client, message);
				});
			 });
		} else {
			message.member.send("No Permissions")
		}
};

module.exports.help = {
	name: "config",
	type: "utility",
	aliases: [],
	desc: `Opens your Server's Config. Here, you can create set the verification channel, verification role, the Restricted Role, and add and edit tier and their levels for your server.`,
	usage: "l^config"
}

const updateVer = async(thisConfig, field, val) => {
	await thisConfig.updateOne({
		field: val
	});

}


const collectMsg = async(message) => {
		const msg = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
			max: 1
		})
		return msg.first().content;
}