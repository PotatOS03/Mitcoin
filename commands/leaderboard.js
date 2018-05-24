// Discord library
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // File for Mitcoin value and all user balances
    let mitcoinInfo = require("../mitcoininfo.json");
    // Sort all user balances and store them in the leaderboard
    let leaderboard = Object.values(mitcoinInfo.balances).sort((a, b) => b.balance - a.balance);
    
    // If there are no existing user balances
    if (leaderboard[0].balance === 0) return message.channel.send("No one has any Mitcoin!");

    // Set the variable for the usernames of all users on the leaderboard
    let usernames = {
        ids: [],
        usernames: []
    };

    // Find the usernames of all leaderboard users
    for (var i = 0; i < Math.min(leaderboard.length, 5); i++) {
        bot.users.forEach(user => {
            if (mitcoinInfo.balances[user.id] && mitcoinInfo.balances[user.id].balance === leaderboard[i].balance && !usernames.ids.includes(user.id)) {
                usernames.ids[i] = user.id;
                usernames.usernames[i] = user.username;
            }
        })
    }

    // Set the variable for what place the user is in
    let userPlace;

    // Find what place the user is in
    for (var i = 0; i < leaderboard.length; i++) {
        if (leaderboard[i].balance === mitcoinInfo.balances[message.author.id].balance) {
            userPlace = i + 1;
        }
    }
    
    // Rich embed message to send the leaderboard in
    let lEmbed = new Discord.RichEmbed()
    .setColor("ff9900")
    .setDescription("Mitcoin Leaderboard")
    .setThumbnail(bot.user.displayAvatarURL)
    .addField("First Place", `${usernames.usernames[0]} | ${leaderboard[0].balance.toFixed(2)} <:MTC:449007845954945026>`)
    if (leaderboard[1] && leaderboard[1].balance > 0) lEmbed.addField("Second Place", `${usernames.usernames[1]} | ${leaderboard[1].balance.toFixed(2)} <:MTC:449007845954945026>`)
    if (leaderboard[2] && leaderboard[2].balance > 0) lEmbed.addField("Third Place", `${usernames.usernames[2]} | ${leaderboard[2].balance.toFixed(2)} <:MTC:449007845954945026>`)
    if (leaderboard[3] && leaderboard[3].balance > 0) lEmbed.addField("Fourth Place", `${usernames.usernames[3]} | ${leaderboard[3].balance.toFixed(2)} <:MTC:449007845954945026>`)
    if (leaderboard[4] && leaderboard[4].balance > 0) lEmbed.addField("Fifth Place", `${usernames.usernames[4]} | ${leaderboard[4].balance.toFixed(2)} <:MTC:449007845954945026>`)
    if (userPlace > 5 && leaderboard[userPlace - 1].balance > 0) lEmbed.addField("Your Place", userPlace)
    lEmbed.setTimestamp(message.createdAt);

    message.channel.send(lEmbed);
}

module.exports.help = {
    name: "leaderboard",
    desc: "View the current Mitcoin leaderboard",
    usage: ""
}