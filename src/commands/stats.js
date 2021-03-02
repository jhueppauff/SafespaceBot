const { MessageEmbed } = require('discord.js');
// Make sure to export properties
module.exports = {
  name: 'stats', // Command name (what's gonna be used to call the command)

  execute(client, message) {
    // Construct info embed
    const embed = new MessageEmbed()
      .setTitle('About')
      .setColor('RANDOM')
      .setDescription('Stats about this bot')
      .addField('Created', client.user.createdAt)
      .addField(
        'Heap Usage',
        `${Math.round(process.memoryUsage().heapUsed / 1048576)}mb`,
        true,
      ) // 1048576 = size of an mb in bytes
      .addField(
        'Uptime',
        new Date(process.uptime() * 1000).toISOString().slice(11, 19),
        true,
      )
      .setFooter('Safespace Bot', client.user.displayAvatarURL);
    // Send message
    message.channel.send({ embed });
  },
};
