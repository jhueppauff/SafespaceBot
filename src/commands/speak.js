const sdk = require('microsoft-cognitiveservices-speech-sdk');
const path = require('path');
const { promises } = require('dns');
const configuration = require('../config.json');

function synthesizeSpeech(text, output, language, voiceName) {
    let speechConfig;
    if (
        configuration.COGNITIVE_SERVICES_APIKEY &&
        configuration.COGNITIVE_SERVICES_APIKEY != '' &&
        configuration.COGNITIVE_SERVICES_APIKEY != 'token'
    ) {
        speechConfig = sdk.SpeechConfig.fromSubscription(
            configuration.COGNITIVE_SERVICES_APIKEY,
            configuration.COGNITIVE_SERVICES_REGION,
        );
    } else if (
        process.env.COGNITIVE_SERVICES_APIKEY &&
        process.env.COGNITIVE_SERVICES_APIKEY != ''
    ) {
        speechConfig = sdk.SpeechConfig.fromSubscription(
            process.env.COGNITIVE_SERVICES_APIKEY,
            process.env.COGNITIVE_SERVICES_REGION,
        );
    } else {
        console.log('No authentication token present');
        return;
    }

    speechConfig.speechSynthesisLanguage = language;
    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(
        path.join(__dirname, `./temp/${output}`),
    );

    let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
        text,
        (result) =>
        new promises((resolve, reject) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                console.log('synthesis finished.');
                resolve();
            } else {
                console.error(
                    `Speech synthesis canceled, ${result.errorDetails}\nDid you update the subscription info?`,
                );

                reject();
            }
            synthesizer.close();
            synthesizer = undefined;
        }),
        (error) => {
            console.trace(`err - ${err}`);
            synthesizer.close();
            synthesizer = undefined;
        },
    );

    console.log('Finished Synthesis');
}

module.exports = {
    name: 'speak',

    async execute(client, message, args) {
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

        let text = args.slice(2);
        await synthesizeSpeech(text.join(' '), 'speak.wav', 'de-DE', 'de-DE-ConradNeural');

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
        let dispatcher = await connection.play(path.join(__dirname, './temp/speak.wav'), {
            volume: 0.8
        });

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