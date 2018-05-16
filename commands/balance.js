// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    
    // The user's Mitcoin balance
    let MTCBal = mitcoinInfo.balances[message.author.id].balance;

    // If the user doesn't have any Mitcoin
    if (MTCBal === 0) return message.reply("you don't have any Mitcoin!");
    // How much the balance is worth in dollars
    let dollarBal = mitcoinInfo.value * MTCBal;
    // Send the user's balance and value
    message.reply(`you have ${Math.round(MTCBal * 100) / 100} MTC, with a total of ${Math.round(dollarBal * 100) / 100} :dollar:`);
}

module.exports.help = {
    name: "balance",
    desc: "Check your balance in Mitcoin",
    usage: ""
}