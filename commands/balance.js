// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    if (!mitcoinInfo.balances) return message.reply(`you don't have any Mitcoin!\nYou can invest up to 1 :dollar:`);
    
    // The user's Mitcoin balance
    let MTCBal = mitcoinInfo.balances[message.author.id].balance;

    // If the user doesn't have any Mitcoin
    if (MTCBal === 0) return message.reply(`you don't have any Mitcoin!\nYou have ${Math.round(mitcoinInfo.balances[message.author.id].money * 100) / 100} :dollar:`);
    // How much the balance is worth in dollars
    let dollarBal = mitcoinInfo.value * MTCBal;
    // Send the user's balance and value
    if (mitcoinInfo.balances[message.author.id].money > 0) return message.reply(`you have ${Math.round(MTCBal * 100) / 100} <:MTC:449007845954945026>, which is about ${Math.round(dollarBal * 100) / 100} :dollar:\nYou also have ${Math.round(mitcoinInfo.balances[message.author.id].money * 100) / 100} :dollar:`);
    message.reply(`you have ${Math.round(MTCBal * 100) / 100} <:MTC:449007845954945026>, which is about ${Math.round(dollarBal * 100) / 100} :dollar:\nYou cannot currently invest any more :dollar:`);
}

module.exports.help = {
    name: "balance",
    desc: "Check your balance in Mitcoin",
    usage: ""
}