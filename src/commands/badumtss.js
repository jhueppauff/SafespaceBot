// Require dependencies
const path = require('path');

// Make sure to export properties
module.exports = {
    name: 'badumtss',

    async execute(client, message) {
        // Module check start
        try {
            require.resolve('@discordjs/opus');
        } catch (err) {
            console.error('> "discordjs/opus" is not installed.');
            try {
                require.resolve('opusscript');
            } catch (err2) {
                return console.error('> "opusscript" is not installed.');
            }
            return null;
        }
        // Module check end

        // Command start
        // Get members current active voice channel.
        const voiceChannel = message.member.voice.channel;

        // Make sure the voice channel is actually defined (aka, they're inside a voice channel).
        if (!voiceChannel)
            return message.reply('You must be in a voice channel first.');

        // We now know the voice channel is defiend, so let's join them.
        // We also store the connection returned from joining the voice channel.
        const connection = await voiceChannel.join();

        // We can use the connection to play the file.
        const dispatcher = await connection.play(
            path.join(__dirname, '../assets/badumtss.mp3'), {
                volume: 0.6,
            },
        );

        // We'll use the dispatcher returned from playing a stream to leave the voice channel
        // once the song is done playing.
        dispatcher
            .on('finish', () => {
                voiceChannel.leave();
            }) // Log any stream errors that might occurr.
            .on('error', (err) => {
                console.error(err);
            });
    },
};