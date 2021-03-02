module.exports = {
  name: 'echo',
  aliases: ['say', 'repeat'],

  execute(client, message, args) {
    // Send a message with the text the user entered after the command.
    // If they didn't pass any args we send a :thinking:
    message.channel.send(
      `> ${args.length !== 0 ? args.join(' ') : ':thinking:'}`,
    );
  },
};
