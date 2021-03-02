module.exports = {
  name: 'ping',
  aliases: ['latency'],

  execute(client, message) {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  },
};
