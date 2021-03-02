const sdk = require('microsoft-cognitiveservices-speech-sdk');
const path = require('path');
const { promises } = require('dns');
const configuration = require('../config.json');

function synthesizeSpeech(text, output, language, voiceName) {
  let speechConfig;
  if (
    configuration.CognitiveServicesApiKey &&
    configuration.CognitiveServicesApiKey != '' &&
    configuration.CognitiveServicesApiKey != 'token'
  ) {
    speechConfig = sdk.SpeechConfig.fromSubscription(
      configuration.CognitiveServicesApiKey,
      configuration.CognitiveServicesRegion,
    );
  } else if (
    process.env.CognitiveServicesApiKey &&
    process.env.CognitiveServicesApiKey != ''
  ) {
    speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.CognitiveServicesApiKey,
      process.env.CognitiveServicesRegion,
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
  name: 'csjoke',

  async execute(client, message) {
    const line1 =
      'Dear son; Your mother and I love you very much, and we miss you dearly ever since you went to prison. I especially miss you now that spring is here, and it is time to plow the fields. The ground is hard, and my back is old. I am afraid I will never be able to plant the crops in time. Your loving father';
    const line2 =
      'Dear Dad; Do not dig in the field. That is where I hide that thing. You know I can not say what it is because they read our mail. Just do not dig out there. Your son';
    const line3 =
      'Dear son; The cops came out and dug up my fields. They said they were looking for something. Thanks, son. It looks like I will get the crops planted. Your loving and grateful father';

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

    await synthesizeSpeech(line1, 'output1.wav', 'en-US', 'en-US-GuyNeural');
    await synthesizeSpeech(line2, 'output2.wav', 'en-GB', 'en-GB-RyanNeural');
    await synthesizeSpeech(line3, 'output3.wav', 'en-US', 'en-US-GuyNeural');

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
      path.join(__dirname, './temp/output1.wav'),
      {
        volume: 0.8,
      },
    );

    dispatcher
      .on('finish', async () => {
        const dispatcher2 = await connection.play(
          path.join(__dirname, './temp/output2.wav'),
          {
            volume: 0.8,
          },
        );

        dispatcher2
          .on('finish', async () => {
            const dispatcher3 = await connection.play(
              path.join(__dirname, './temp/output3.wav'),
              {
                volume: 0.8,
              },
            );
            dispatcher3
              .on('finish', async () => {
                voiceChannel.leave();
              }) // Log any stream errors that might occurr.
              .on('error', (err) => {
                console.error(err);
              });
          }) // Log any stream errors that might occurr.
          .on('error', (err) => {
            console.error(err);
          });
      }) // Log any stream errors that might occurr.
      .on('error', (err) => {
        console.error(err);
      });
  },
};
