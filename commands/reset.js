// Discord library
const Discord = require("discord.js");
// Save to files
const fs = require("fs");

module.exports.run = async (bot, message, args) => {
    // Check if the user is a Mitcoin executive
    if (message.author.id !== "365444992132448258" && message.author.id !== "286664522083729409") return message.channel.send("You don't have the permissions.");

    // If the user doesn't specify what to reset
    if (!args[0]) return message.channel.send("Specify what to reset");

    // If the argument given is not valid
    if (args[0] !== "value" && args[0] !== "balances" && args[0] !== "all") return message.channel.send("Reset either `value`, `balances`, or `all`")

    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    
    // Reset the value
    if (args[0] === "value" || args[0] === "all") {
        mitcoinInfo.value = 1;
    }
    // Reset the balances
    if (args[0] === "balances" || args[0] === "all") {
        mitcoinInfo.balances = {};
    }

    // Save the file
    fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));
    
    // Send the confirmation message
    if (args[0] !== "all") return message.channel.send(`Mitcoin ${args[0]} reset.`);
    message.channel.send("Mitcoin value and balances reset.");
}

module.exports.help = {
    name: "reset",
    desc: "Reset Mitcoin info",
    usage: " [value/balances/all]"
}