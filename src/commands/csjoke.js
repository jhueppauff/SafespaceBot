const sdk = require("microsoft-cognitiveservices-speech-sdk");
const configuration = require("../config.json");
const path = require('path');

async function synthesizeSpeech(text, output) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(configuration.CognitiveServicesApiKey, configuration.CognitiveServicesRegion);

    speechConfig.speechSynthesisLanguage = "en-US";
    speechConfig.speechSynthesisVoiceName = "en-US-GuyNeural";
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(path.join(__dirname, `./temp/${output}`));

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(text,
        result => {
            if (result) {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log("synthesis finished.");
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails);
                }
            }
            synthesizer.close();
        },
        error => {
            console.log(error);
            synthesizer.close();
        });

    return;
};

module.exports = {
    name: 'csjoke',

    async execute(client, message) {
        const line1 = "Dear son; Your mother and I love you very much, and we miss you dearly ever since you went to prison. I especially miss you now that spring is here, and it is time to plow the fields. The ground is hard, and my back is old. I am afraid I will never be able to plant the crops in time. Your loving father";
        const line2 = "Dear Dad; Do not dig in the field. That is where I hide that thing. You know I can not say what it is because they read our mail. Just do not dig out there. Your son";
        const line3 = "Dear son; The cops came out and dug up my fields. They said they were looking for something. Thanks, son. It looks like I will get the crops planted. Your loving and grateful father";

        // Command start
        // Get members current active voice channel.
        const voiceChannel = message.member.voice.channel;

        // Make sure the voice channel is actually defined (aka, they're inside a voice channel).
        if (!voiceChannel) return message.reply('You must be in a voice channel first.');

        // We now know the voice channel is defiend, so let's join them.
        // We also store the connection returned from joining the voice channel.
        const connection = await voiceChannel.join();

        try { require.resolve('@discordjs/opus'); } catch (err) {
            console.error('> "discordjs/opus" is not installed.');
            try { require.resolve('opusscript'); } catch (err2) { return console.error('> "opusscript" is not installed.'); }
            return null;
        }

        if (configuration.CognitiveServicesApiKey && configuration.CognitiveServicesApiKey != '' && configuration.CognitiveServicesApiKey != 'token') {
            client.login(configuration.CognitiveServicesApiKey);
        } else if (process.env.CognitiveServicesApiKey && process.env.CognitiveServicesApiKey != "") {
            client.login(process.env.CognitiveServicesApiKey);
        } else {
            console.log("No authentication token present")
            return;
        }

        await synthesizeSpeech(line1, "output1.wav");
        await synthesizeSpeech(line2, "output2.wav");
        await synthesizeSpeech(line3, "output3.wav");

        // We can use the connection to play the file.
        let dispatcher = await connection.play(path.join(__dirname, './temp/output1.wav'), {
            volume: 0.8
        });

        dispatcher = await connection.play(path.join(__dirname, './temp/output2.wav'), {
            volume: 0.8
        });

        dispatcher = await connection.play(path.join(__dirname, './temp/output3.wav'), {
            volume: 0.8
        });

        // We'll use the dispatcher returned from playing a stream to leave the voice channel
        // once the song is done playing.
        dispatcher.on('finish', () => {
                voiceChannel.leave();
            }) // Log any stream errors that might occurr.
            .on('error', err => {
                console.error(err);
            });
    }
}