// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");

    // Send the message saying Mitcoin's value
    message.channel.send(`1 <:MTC:449007845954945026> is currently worth about ${mitcoinInfo.value.toFixed(3)} :dollar:`)
}

module.exports.help = {
    name: "value",
    desc: "View Mitcoin's value",
    usage: ""
}