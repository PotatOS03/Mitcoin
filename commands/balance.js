// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    if (!mitcoinInfo.balances) return message.reply(`you don't have any Mitcoin!\nYou can invest up to 1 :dollar:`);
    
    // The user's Mitcoin balance
    let MTCBal = mitcoinInfo.balances[message.author.id].balance;

    // If the user doesn't have any Mitcoin
    if (MTCBal === 0 && mitcoinInfo.balances[message.author.id].money === 0) return message.reply(`you don't have any Mitcoin or any :dollar:\nYou are broke until someone else can pay you!`);
    if (MTCBal === 0) return message.reply(`you don't have any Mitcoin!\nYou have ${mitcoinInfo.balances[message.author.id].money.toFixed(2)} :dollar:`);
    // How much the balance is worth in dollars
    let dollarBal = mitcoinInfo.value * MTCBal;
    // Send the user's balance and value
    if (mitcoinInfo.balances[message.author.id].money > 0) return message.reply(`you have ${MTCBal.toFixed(2)} <:MTC:449007845954945026>, which is about ${dollarBal.toFixed(2)} :dollar:\nYou also have ${mitcoinInfo.balances[message.author.id].money.toFixed(2)} :dollar:`);
    message.reply(`you have ${MTCBal.toFixed(2)} <:MTC:449007845954945026>, which is about ${dollarBal.toFixed(2)} :dollar:\nYou cannot currently invest any more :dollar:`);
}

module.exports.help = {
    name: "balance",
    desc: "Check your balance in Mitcoin",
    usage: ""
}