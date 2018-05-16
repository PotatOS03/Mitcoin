// Discord library
const Discord = require("discord.js");
// Save to files
const fs = require("fs");

module.exports.run = async (bot, message, args) => {
    // Check if the user is a Mitcoin executive
    if (message.author.id !== "365444992132448258" && message.author.id !== "286664522083729409") return message.channel.send("You don't have the permissions.");

    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    // Calculate a random amount to change Mitcoin's value by
    let fluctuation = Math.round(Math.random() * (50 + 100 / 3) - 100 / 3);

    // Change the value by the random amount
    mitcoinInfo.value *= (fluctuation + 100) / 100;
    // Save to the file
    fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));

    // If Mitcoin's value is increased
    if (fluctuation > 0) message.channel.send(`:loudspeaker: BREAKING NEWS: The vaule of Mitcoin has been raised by ${fluctuation}% :chart_with_upwards_trend:\n1 MTC is now worth about ${Math.round(mitcoinInfo.value * 100) / 100} :dollar:`);
    // If Mitcoin's value is decreased
    if (fluctuation < 0) message.channel.send(`:loudspeaker: BREAKING NEWS: The vaule of Mitcoin has been lowered by ${-fluctuation}% :chart_with_downwards_trend:\n1 MTC is now worth about ${Math.round(mitcoinInfo.value * 100) / 100} :dollar:`);
}

module.exports.help = {
    name: "marketfluctuation",
    desc: "Fluctuate Mitcoin's value",
    usage: ""
}