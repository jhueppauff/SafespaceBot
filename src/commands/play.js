// Require dependencies
const path = require('path');

// Make sure to export properties
module.exports = {
    name: 'playFile', // Command name (what's gonna be used to call the command)
    aliases: ['play'],
    // This command requires you to have 'node-opus' or 'opusscript' installed in order to work.
    // The first lines (10 - 16) are just to make sure it's not executed if any of those aren't installed.
    async execute(client, message) {
        // Module check start
        try { require.resolve('node-opus'); } catch (err) {
            console.error('> "node-opus" is not installed.');
            try { require.resolve('opusscript'); } catch (err2) { return console.error('> "opusscript" is not installed.'); }
            return null;
        }
        // Module check end

        // Command start
        // Get members current active voice channel.
        const voiceChannel = message.member.voiceChannel;
        // Make sure the voice channel is actually defined (aka, they're inside a voice channel).
        if (!voiceChannel) return message.reply('You must be in a voice channel first.');
        // We now know the voice channel is defiend, so let's join them.
        // We also store the connection returned from joining the voice channel.
        const connection = await voiceChannel.join();
        // We can use the connection to play the file.
        const dispatcher = await connection.playFile(path.resolve(__dirname, '../assets/Closer.mp3'));
        // We'll use the dispatcher returned from playing a stream to leave the voice channel
        // once the song is done playing.
        dispatcher.on('end', () => {
                voiceChannel.leave();
            }) // Log any stream errors that might occurr.
            .on('error', err => {
                console.error(err);
            });
    }
};