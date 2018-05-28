// Discord library
const Discord = require("discord.js");
const fs = require("fs");
let sales = {};

module.exports.run = async (bot, message, args) => {
    // If no amount is specified
    if (!args[0]) return message.channel.send("Specify an amount to sell");
    
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    
    let sellAmount = parseFloat(args[0]).toFixed(3);
    if (args[0].toLowerCase() === "all") sellAmount = mitcoinInfo.balances[message.author.id].balance;

    if (mitcoinInfo.balances[message.author.id].balance === 0) return message.reply("you don't have any Mitcoin!");
    if (!sellAmount || sellAmount <= 0 || sellAmount === "NaN") return message.channel.send(`Specify a valid number to sell`);
    if (sellAmount > 3) return message.channel.send("You can not sell more than 3 Mitcoin");
    
    // If the user has less Mitcoin than they say to pay
    if (mitcoinInfo.balances[message.author.id].balance < sellAmount) return message.reply("you don't have enough Mitcoin to sell!");

    // Set up for daily cooldown
    if (!sales[message.author.id]) sales[message.author.id] = {
        sales: 0
    }
    
    if (sales[message.author.id].sales > 0) return message.reply("you can only sell once per day");
    sales[message.author.id].sales += sellAmount;
    setTimeout(function() {
        sales[message.author.id].sales = 0;
        message.reply("you may sell again!");
    }, 86400000);

    // Actually calculate the sale
    mitcoinInfo.balances[message.author.id].balance -= sellAmount;
    mitcoinInfo.balances[message.author.id].money += sellAmount * mitcoinInfo.value;

    // Save the file
    fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));

    let logChannel = bot.channels.find("id", "446758326035021824");
    logChannel.send(JSON.stringify(mitcoinInfo));

    // Send the confirmation message
    message.channel.send(`${message.author} has sold ${Math.round(sellAmount * 1000) / 1000} <:MTC:449007845954945026> and recieved ${(sellAmount * mitcoinInfo.value).toFixed(2)} :dollar:`);
}

module.exports.help = {
    name: "sell",
    desc: "Sell <:MTC:449007845954945026> for :dollar:",
    usage: " [amount]"
}