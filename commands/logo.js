// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // Rich embed to send the logo in
    let logoEmbed = new Discord.RichEmbed()
    .setTitle("Don't Delay. Invest Today!")
    .setColor("ff9900")
    .setImage("https://media.discordapp.net/attachments/385158866729566219/424363072472219649/unknown.png");

    message.channel.send(logoEmbed);
}

module.exports.help = {
    name: "logo",
    desc: "See the Mitcoin logo",
    usage: ""
}