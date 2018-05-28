// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    if (!mitcoinInfo.balances) return message.reply(`you don't have any Mitcoin!\nYou can invest up to 1 :dollar:`);
    
    // The user's Mitcoin balance
    let MTCBal = mitcoinInfo.balances[message.author.id].balance;

    // Embed to show the user's balance information
    let balEmbed = new Discord.RichEmbed()
    .setColor("ff9900")
    .setAuthor(message.author.username, message.author.displayAvatarURL)
    .addField("Mitcoin", `${MTCBal.toFixed(3)} <:MTC:449007845954945026>`, true)
    .addField("Equivalent value", `${(mitcoinInfo.value * MTCBal).toFixed(2)} :dollar:`, true)
    .addField("Money", `${mitcoinInfo.balances[message.author.id].money.toFixed(2)} :dollar:`)

    message.channel.send(balEmbed);
}

module.exports.help = {
    name: "balance",
    desc: "Check your balance in Mitcoin",
    usage: ""
}