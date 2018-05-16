// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    // Sort all user balances and store them in the leaderboard
    let leaderboard = Object.values(mitcoinInfo.balances).sort((a, b) => b.balance > a.balance);

    // If there are no existing user balances
    if (leaderboard[0].balance === 0) return message.channel.send("No one has any Mitcoin!");

    // Set the variable for what place the user is in
    let userPlace;

    // Find what place the user is in
    for (var i = 0; i < leaderboard.length; i++) {
        if (leaderboard[i].name === message.author.username) {
            userPlace = i + 1;
        }
    }
    
    // Rich embed message to send the leaderboard in
    let lEmbed = new Discord.RichEmbed()
    .setColor("ff9900")
    .setDescription("Mitcoin Leaderboard")
    .setThumbnail("https://cdn.discordapp.com/avatars/424282907243446272/e011f67f9962da2210b0240a6aca4284.png?size=2048")
    .addField("First Place", `${leaderboard[0].name} | ${Math.round(leaderboard[0].balance * 100) / 100} MTC`)
    if (leaderboard[1]) lEmbed.addField("Second Place", `${leaderboard[1].name} | ${Math.round(leaderboard[1].balance * 100) / 100} MTC`)
    if (leaderboard[2]) lEmbed.addField("Third Place", `${leaderboard[2].name} | ${Math.round(leaderboard[2].balance * 100) / 100} MTC`)
    if (leaderboard[3]) lEmbed.addField("Fourth Place", `${leaderboard[3].name} | ${Math.round(leaderboard[3].balance * 100) / 100} MTC`)
    if (leaderboard[4]) lEmbed.addField("Fifth Place", `${leaderboard[4].name} | ${Math.round(leaderboard[4].balance * 100) / 100} MTC`)
    if (userPlace > 5) lEmbed.addField("Your Place", userPlace)
    lEmbed.setTimestamp(message.createdAt);

    message.channel.send(lEmbed);
}

module.exports.help = {
    name: "leaderboard",
    desc: "View the current Mitcoin leaderboard",
    usage: ""
}