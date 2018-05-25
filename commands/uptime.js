const Discord = require("discord.js");
let uptime = 0;
setInterval(e => uptime++, 1);

module.exports.run = async (bot, message, args) => {
    let uptimeMsg = "";
    
    if (uptime >= 86400000) uptimeMsg += `${Math.floor(uptime / 86400000)}d, `;
    if (uptime >= 3600000) uptimeMsg += `${Math.floor((uptime % 86400000) / 3600000)}h, `;
    if (uptime >= 60000) uptimeMsg += `${Math.floor((uptime % 3600000) / 60000)}m, `;
    uptimeMsg += `${(uptime % 60000) / 1000}s`;
    
    message.channel.send(`BOT UPTIME: \`${uptimeMsg}\``);
}

module.exports.help = {
    name: "uptime",
    desc: "See how long the bot has been running"
}