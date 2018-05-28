const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async(bot, message, args) => {
    let mitcoinInfo = require("../mitcoininfo.json");
    
    let botCount = 0;
    message.guild.members.forEach(m => {
        if (m.user.bot) botCount++;
    })
    let winner = Math.floor(Math.random() * (message.guild.members.size - botCount));
    
    let winMember = 0;
    message.guild.members.forEach(m => {
        if (!m.user.bot) {
            if (winner === 0) winMember = m;
        }
        winner--;
    })

    if (winMember === 0) return message.channel.send(":confused: something went wrong... try again, please!");

    if (!mitcoinInfo.balances[winMember.id]) mitcoinInfo.balances[winMember.id] = {
        balance: 0,
        money: 1
    }

    let winAmount = Math.random().toFixed(2) * 5;

    mitcoinInfo.balances[winMember.id].balance += winAmount;

    fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));

    message.channel.send(`Congratulations to ${winMember.toString()}! You have just earned a free ${winAmount} <:MTC:449007845954945026>, which is about ${(winAmount * mitcoinInfo.value).toFixed(2)} :dollar:`);
}

module.exports.help = {
    name: "giveaway",
    desc: "Give a random amount of MTC to a random user",
    usage: " [low] (high)"
}