const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let helpEmbed = new Discord.RichEmbed()
    .setDescription("List of commands")
    .setColor("ff9900")
    .addField("Prefix", "m/")
    .addField("balance", "Check your balance in Mitcoin")
    .addField("give", "Give someone an amount of Mitcoin")
    .addField("leaderboard", "View the current Mitcoin leaderboard")
    .addField("logo", "See the Mitcoin logo")
    .addField("value", "View Mitcoin's value")
    .addField("How to invest", "Simply type 💵 in the chat up to three times to invest in MTC")
    
    message.channel.send(helpEmbed);
}

module.exports.help = {
    name: "help",
    desc: "Generate a list of commands",
    usage: " [page]"
}