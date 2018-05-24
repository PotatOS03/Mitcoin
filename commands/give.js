// Discord library
const Discord = require("discord.js");
const fs = require("fs");
let payments = {};

module.exports.run = async (bot, message, args) => {
    // If no user is specified to pay to
    if (!args[0]) return message.channel.send("Specify a user to pay");

    // First user that is mentioned
    let payUser = message.mentions.members.first();
    if (!payUser || payUser.user.bot) return message.channel.send("Specify a valid user");
    if (payUser === message.member) return message.channel.send("You can't pay yourself!")
    
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");

    // If no amount is specified
    if (!args[1]) return message.channel.send("Specify an amount to pay");

    let payAmount = parseFloat(args[1]).toFixed(2);
    if (args[1].toLowerCase() === "all") payAmount = mitcoinInfo.balances[message.author.id].balance;

    if (mitcoinInfo.balances[message.author.id].balance === 0) return message.reply("you don't have any Mitcoin!");
    if (!payAmount || payAmount <= 0) return message.channel.send(`Specify a valid number to pay`);
    if (payAmount > 3) return message.channel.send("You can not pay more than 3 Mitcoin");
    
    // If the user has less Mitcoin than they say to pay
    if (mitcoinInfo.balances[message.author.id].balance < payAmount) return message.reply("you don't have enough Mitcoin to pay!");

    // Set up for daily cooldown
    if (!payments[message.author.id]) payments[message.author.id] = {
        payments: 0
    }
    
    if (payments[message.author.id].payments > 0) return message.reply("You can only pay once per day");
    payments[message.author.id].payments += payAmount;
    setTimeout(function() {
        payments[message.author.id].payments = 0;
        message.reply("you may give again!");
    }, 86400000);

    if (!mitcoinInfo.balances[payUser.id]) mitcoinInfo.balances[payUser.id] = {
        balance: 0,
        money: 1
    };

    // Actually calculate the payment
    mitcoinInfo.balances[message.author.id].balance -= payAmount;
    mitcoinInfo.balances[payUser.id].balance += payAmount;

    // Save the file
    fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));

    let logChannel = bot.channels.find("id", "446758326035021824");
    logChannel.send(JSON.stringify(mitcoinInfo));

    // Send the confirmation message
    message.channel.send(`${message.author} has given ${payAmount} <:MTC:449007845954945026> to ${payUser}`);
}

module.exports.help = {
    name: "give",
    desc: "Give someone an amount of Mitcoin",
    usage: " [user] [amount]"
}