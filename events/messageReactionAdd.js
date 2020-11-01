const redis = require("../utils/redis");

module.exports = async (client, reaction) => {

  const redisClient = await redis()
  const redisKey = `poll-${reaction.message.id}`

  redisClient.get(redisKey, (err, result) => {
    redisClient.quit();
    if(result) {
      const Discord = require('discord.js');
      const channel = reaction.message.channel;

      const oldEmb = reaction.message.embeds[0];
      const oldEmbForm = new Discord.MessageEmbed(oldEmb);

      let countX = 0;
      let countCheck = 0;

      reaction.message.reactions.cache.forEach(emoji => {
        switch(emoji.emoji.id) {
          case '766801202297045002':
            countCheck = emoji.count;
          break;
          case '766801174543728660':
            countX = emoji.count;
          break; 
        }
      });

      const poll = channel.messages.cache.get(reaction.message.id);
        oldEmbForm.fields = [];
        oldEmbForm.addFields({ name: `Positive:`, value: getAverages(countCheck/(countCheck + countX), "pos").join(""), inline: true }, { name: `Negative:`, value: getAverages(countX/(countCheck + countX), "neg").join(""), inline: true });
        poll.edit(oldEmbForm);
    }
  });
};


const getAverages = (num, posneg) => {
  let arr = new Array(10);

  let roundedNum = Math.round(num*10);


  for(let it = 0 ; it < 10 ; it++) {
    switch(posneg) {
      case 'pos':
        (roundedNum <= it) ? arr[it] = ('⬛') : arr[it] = ('🟩')
        
      break;
      case 'neg':
        (roundedNum <= it) ? arr[it] = ('⬛') : arr[it] = ('🟥')
      break;
      
    }
  }
  return arr
}