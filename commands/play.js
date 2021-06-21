const ytdl = require("ytdl-core");

module.exports = {
  name: "play",
  description: "Plays given song.",
  async execute(msg, args) {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
      return msg.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return msg.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    const songInfo = await ytdl.getInfo(args[0]);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
      const queueContruct = {
        textChannel: msg.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      queue.set(msg.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        const queue = msg.client.queue;
        const guild = msg.guild;
        const serverQueue = queue.get(msg.guild.id);

        if (!queueContruct.songs[0]) {
          serverQueue.voiceChannel.leave();
          queue.delete(guild.id);
          return;
        }

        const dispatcher = serverQueue.connection
          .play(ytdl(queueContruct.songs[0].url))
          .on("finish", () => {
            serverQueue.songs.shift();
            this.play(msg, serverQueue.songs[0]);
          })
          .on("error", (error) => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(
          `Start playing: **${queueContruct.songs[0].title}**`
        );
      } catch (err) {
        console.log(err);
        queue.delete(msg.guild.id);
        return msg.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return msg.channel.send(`${song.title} has been added to the queue!`);
    }
  },
};
