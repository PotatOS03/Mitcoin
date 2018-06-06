// Bot setup
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const Jimp = require("jimp");
const bot = new Discord.Client({disableEveryone: true});

const { Pool, Client } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
pool.query("SELECT NOW()", (err, res) => {
  console.log(err, res);
  pool.end();
})

const client = new Client({
  connectionString: process.env.DATABASE_URL
})
client.connect();
client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
})

client.query("CREATE TABLE balances (id INTEGER PRIMARY KEY, mitcoin NUMERIC, money NUMERIC");
client.query("INSERT INTO balances VALUES (1, 0, 1)");

// Mitcoin value and all user balances
let mitcoinInfo = require("./mitcoininfo.json");

// Mitcoin executives PotatOS and Mitrue
let executives = ["286664522083729409", "365444992132448258"];

// MTC logo emoji
let MTC = "<:MTC:452553160557461544>";

// How many milliseconds it takes for Mitcoin's value to automatically fluctuate
let fluctuationTime = ms("10m");

// Automatically fluctuate Mitcoin's value
setInterval(function() {
  let fluctuation = Math.round(Math.random() * 10 - 5);
  
  // Change Mitcoin's value
  mitcoinInfo.value *= (fluctuation + 100) / 100;
  mitcoinInfo.history.push(parseFloat(mitcoinInfo.value.toFixed(3)));
  bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(2)} | m/help`);
  
  // Channel to send logs to
  let logChannel = bot.channels.find("id", "446758326035021824");
  for (let i = 0; i < JSON.stringify(mitcoinInfo).length; i += 2000) logChannel.send(JSON.stringify(mitcoinInfo).substr(i, 2000));
  
  fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));
}, fluctuationTime);

// When the bot is loaded
bot.on("ready", async () => {
  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);
  bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(2)} | m/help`);

  // Channel to send logs to
  let logChannel = bot.channels.find("id", "446758326035021824");
  logChannel.send("Update mitcoininfo!");
  
  let PotatOS = bot.users.find("id", executives[0]);
  PotatOS.send("Update mitcoininfo!");
});

// Bot uptime
let uptime = 0;
setInterval(e => uptime++, 1);

// All bot commands
const commands = {
  balance: {
    name: "balance",
    desc: "Check your balance in Mitcoin",
    run: (message, args) => {
      let balUser = message.author;
      if (executives.includes(message.author.id)) {
        balUser = message.mentions.members.first() || bot.users.find("id", args[0] || message.author.id) || message.author;
      }
      balUser = balUser.user || balUser;
      if (balUser.bot) balUser = message.author;

      // If the user doesn't have a Mitcoin balance yet, set it up
      if (!mitcoinInfo.balances[balUser.id]) mitcoinInfo.balances[balUser.id] = {
        balance: 0,
        money: 1
      }

      // The user's Mitcoin balance
      let MTCBal = mitcoinInfo.balances[balUser.id].balance;
  
      // Embed to show the user's balance information
      let balEmbed = new Discord.RichEmbed()
      .setColor("ff9900")
      .setAuthor(balUser.username, balUser.displayAvatarURL)
      .addField("Mitcoin", `${MTCBal.toFixed(3)} ${MTC}`, true)
      .addField("Equivalent value", `${(mitcoinInfo.value * MTCBal).toFixed(2)} :dollar:`, true)
      .addField("Money", `${mitcoinInfo.balances[balUser.id].money.toFixed(2)} :dollar:`)
      if (mitcoinInfo.blacklist.includes(balUser.id)) balEmbed.setFooter("You are blacklisted from using Mitcoin")
  
      message.channel.send(balEmbed);
    }
  },
  blacklist: {
    name: "blacklist",
    run: (message, args) => {
      if (!executives.includes(message.author.id)) return;

      if (!args[0]) return message.author.send(`**List of blacklisted users:**\n${mitcoinInfo.blacklist.length > 0 ? `<@${mitcoinInfo.blacklist.join(">\n<@")}>` : "None"}`);

      let blacklistUser = bot.users.find("id", args[0]) || bot.users.find("username", args.join(" ")) || message.mentions.members.first();
      if (!blacklistUser) return message.channel.send(`${args.join(" ")} is not a valid user`);
      blacklistUser = blacklistUser.user || blacklistUser;

      if (mitcoinInfo.blacklist.includes(blacklistUser.id)) {
        message.channel.send(`User: \`${blacklistUser.username}\` successfully removed from blacklist`);
        return mitcoinInfo.blacklist.splice(mitcoinInfo.blacklist.indexOf(blacklistUser.id), 1)
      }

      message.channel.send(`User: \`${blacklistUser.username}\` successfully added to blacklist`);
      mitcoinInfo.blacklist.push(blacklistUser.id);
    }
  },
  change: {
    name: "change",
    desc: "View how much Mitcoin's value has changed over time",
    run: (message, args) => {
      if (!args[0]) return message.channel.send("Specify a time");
      let time = args.join("");
      if (time.toLowerCase() === "all") time = mitcoinInfo.history.length * fluctuationTime;
      if (!ms(time) || time <= 0 || ms(time) <= 0) return message.channel.send("Specify a valid time");

      if (mitcoinInfo.history.length < ms(time) / fluctuationTime) time = mitcoinInfo.history.length * fluctuationTime;
      if (time / time !== 1) time = ms(time);
      time = Math.floor(time / fluctuationTime) * fluctuationTime;
      if (time < fluctuationTime) time = fluctuationTime;
      
      let timeString = "";
      if (time >= 86400000) timeString += `${Math.floor(time / 86400000)}d, `;
      if (time >= 3600000) timeString += `${Math.floor((time % 86400000) / 3600000)}h, `;
      if (time >= 60000) timeString += `${Math.floor((time % 3600000) / 60000)}m, `;
      timeString += `${(time % 60000) / 1000}s`;

      let changeEmbed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setTitle(`Mitcoin change over the past ${timeString}`)
      .addField(`${time / fluctuationTime} fluctuations`, `${(mitcoinInfo.value / mitcoinInfo.history[mitcoinInfo.history.length - time / fluctuationTime]).toFixed(2)}%`)

      message.channel.send(changeEmbed);
    }
  },
  complain: {
    name: "complain",
    run: (message, args) => {
      if (!complaints[message.author.id]) complaints[message.author.id] = {complaints: 0};
      if (complaints[message.author.id].complaints >= 1) return message.reply("you can only send one complaint per day");
      
      let complaint = args.join(" ");
      if (!complaint) return message.channel.send("Specify a message");

      complaints[message.author.id].complaints++;
      setTimeout(function() {
        complaints[message.author.id].complaints--;
      }, 86400000);

      let complaintChannel = bot.channels.find("id", "452269954167865345");

      let complaintEmbed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .addField("New complaint", complaint)
      .setTimestamp(message.createdAt);

      message.channel.send("✅ Your complaint has been sent and will be viewed shortly");
      complaintChannel.send(complaintEmbed);
    }
  },
  give: {
    name: "give",
    desc: `Give a user an amount of Mitcoin\nTips to Mitcoin executives <@${executives.join("> and <@")}> are greatly appreciated`,
    run: (message, args) => {
      if (mitcoinInfo.blacklist.includes(message.author.id)) return message.reply("you are blacklisted from using Mitcoin");

      // If the user doesn't have any Mitcoin to pay
      if (mitcoinInfo.balances[message.author.id].balance === 0) return message.reply("you don't have any Mitcoin!");

      // If no user is specified to pay to
      if (!args[0]) return message.channel.send("Specify a user to pay");
  
      // First user that is mentioned
      let payUser = bot.users.find("id", args[0]) || message.mentions.members.first();
      payUser = payUser.user || payUser;
      
      if (!payUser || payUser.bot) return message.channel.send("Specify a valid user");
      if (payUser === message.author) return message.channel.send("You can't pay yourself!");
      
      // If no amount is specified
      if (!args[1]) return message.channel.send("Specify an amount to pay");
      if (args[0] !== `<@${payUser.id}>` && args[0] !== `<@!${payUser.id}>` && args[0] !== payUser.id) return message.channel.send("Specify the member, then the number");
  
      let payAmount = parseFloat(args[1]).toFixed(3);
      if (args[1].toLowerCase() === "all") payAmount = mitcoinInfo.balances[message.author.id].balance;
  
      if (!payAmount || payAmount === "NaN" || payAmount <= 0) return message.channel.send(`Specify a valid number to pay`);
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
      mitcoinInfo.balances[payUser.id].balance += parseFloat(payAmount);
  
      // Send the confirmation message
      message.channel.send(`${message.author} has given ${payAmount} ${MTC} to ${payUser.username}`);
    }
  },
  giveaway: {
    name: "giveaway",
    run: (message, args) => {
      if (!executives.includes(message.author.id)) return;

      if (!args[0]) return message.channel.send("Specify a time");
      time = args[0];
      if (!ms(time) || time <= 0 || ms(time) <= 0) return message.channel.send("Specify a valid time");

      if (time / time === 1) time = ms(time);

      if (!args[1]) return message.channel.send("Specify a range of values");
      let min = parseFloat(args[1]);
      let max = parseFloat(args[2]) || min;
      if ((!min && min !== 0) || !max) return message.channel.send("Specify a valid range");
      
      let winAmount = Math.random().toFixed(2) * (max - min) + min;

      let giveEmbed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setTitle(`New ${MTC} Giveaway!`)
      .addField(`How much MTC is available?`, winAmount)
      .addField("To enter the giveaway", `React to this message with the ${MTC} emoji`)
      .setTimestamp(message.createdAt)
      .setFooter(`This giveaway will end in ${time}`)
      
      message.delete();
      message.channel.send(giveEmbed).then(msg => {
        msg.react(MTC.split(/:|>/)[2]);
        setTimeout(function() {
          msg.delete();

          let reacters = msg.reactions.get(MTC.split(/<:|>/)[1]);

          let winner = Math.floor(Math.random() * reacters.count);

          let winUser = 0;
          reacters.users.forEach(r => {
            if (!r.bot && winner <= 0 && winUser === 0) winUser = r;
            winner--;
          })
          
          if (winUser === 0) return message.channel.send("**No one reacted to the giveaway!**\n__Make sure to react before the time runs out.__");

          if (!mitcoinInfo.balances[winUser.id]) mitcoinInfo.balances[winUser.id] = {
            balance: 0,
            money: 1
          }
      
          mitcoinInfo.balances[winUser.id].balance += winAmount;

          let winEmbed = new Discord.RichEmbed()
          .setColor("#ff9900")
          .setTitle(`${MTC} Giveaway ended!`)
          .addField("Winner", `<@${winUser.id}>`)
          .addField("Amount won", `${winAmount} ${MTC}`)
          .setTimestamp(msg.createdAt)

          message.channel.send(winEmbed);
        }, ms(time))
      })
    }
  },
  graph: {
    name: "graph",
    desc: "View a graph of Mitcoin's value over time",
    run: async (message, args) => {
      Jimp.read("graphLayout.png", async (err, image) => {
        if (err) return console.log(err);
        image.write("graph.png");

        message.channel.send(`${{files: ["graph.png"]}}`)
      })
    }
  },
  help: {
    name: "help",
    run: (message, args) => {
      let helpEmbed = new Discord.RichEmbed()
      .setDescription("List of commands")
      .setColor("ff9900")
      .addField("Prefix", botconfig.prefix)
      for (let i in commands) {
        if (commands[i].desc) helpEmbed.addField(commands[i].name, commands[i].desc)
      }

      message.channel.send(helpEmbed);
    }
  },
  invest: {
    name: "invest",
    desc: "Invest in a certain amount of Mitcoin",
    run: (message, args) => {
      if (mitcoinInfo.blacklist.includes(message.author.id)) return message.reply("you are blacklisted from using Mitcoin");
      
      if (mitcoinInfo.balances[message.author.id].money < 0.01) return message.reply("you can't invest in any Mitcoin!")
      if (!args[0]) return message.channel.send("Specify an amount to invest");

      let investAmount = parseFloat(args[0]);
      if (args[0].toLowerCase() === "all") investAmount = mitcoinInfo.balances[message.author.id].money;

      if (!investAmount || investAmount < 0.01) return message.channel.send("Specify a valid amount to invest");
      if (investAmount > 10) return message.reply("you can't invest in that much MTC!");
      
      if (investAmount > mitcoinInfo.balances[message.author.id].money) return message.reply("you don't have enough :dollar:");

      if (!investments[message.author.id]) investments[message.author.id] = {invested: 0};
      if (investments[message.author.id].invested + investAmount > 10) return message.reply(`you can only invest 10 :dollar: per day`);

      setTimeout(function() {
        investments[message.author.id].invested -= investAmount;
        if (investments[message.author.id].invested + investAmount === 10) message.reply("you may invest again!");
      }, 86400000);
      
      // Add the invested amount to the user's daily investments
      investments[message.author.id].invested += investAmount;
      
      // Add the invested amount to the user's balance
      mitcoinInfo.balances[message.author.id].balance += investAmount / mitcoinInfo.value;
      mitcoinInfo.balances[message.author.id].money -= investAmount;
      
      // Send the message
      if (mitcoinInfo.balances[message.author.id].money > 0) return message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value).toFixed(3)} ${MTC} after investing ${investAmount.toFixed(2)} :dollar: and has ${(mitcoinInfo.balances[message.author.id].money).toFixed(2)} :dollar: left to invest`);
      message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value).toFixed(3)} ${MTC} after investing ${investAmount.toFixed(2)} :dollar: and cannot invest any more :dollar:`);
    }
  },
  leaderboard: {
    name: "leaderboard",
    desc: "View the current Mitcoin leaderboard",
    run: (message, args) => {
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
          if (!usernames.usernames[i]) {
            leaderboard.splice(i, 1);
            i--;
          }
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
      .addField("First Place", `${usernames.usernames[0]} | ${leaderboard[0].balance.toFixed(2)} ${MTC}`)
      if (leaderboard[1] && leaderboard[1].balance > 0) lEmbed.addField("Second Place", `${usernames.usernames[1]} | ${leaderboard[1].balance.toFixed(2)} ${MTC}`)
      if (leaderboard[2] && leaderboard[2].balance > 0) lEmbed.addField("Third Place", `${usernames.usernames[2]} | ${leaderboard[2].balance.toFixed(2)} ${MTC}`)
      if (leaderboard[3] && leaderboard[3].balance > 0) lEmbed.addField("Fourth Place", `${usernames.usernames[3]} | ${leaderboard[3].balance.toFixed(2)} ${MTC}`)
      if (leaderboard[4] && leaderboard[4].balance > 0) lEmbed.addField("Fifth Place", `${usernames.usernames[4]} | ${leaderboard[4].balance.toFixed(2)} ${MTC}`)
      if (userPlace > 5 && leaderboard[userPlace - 1].balance > 0) lEmbed.addField("Your Place", userPlace)
      lEmbed.setTimestamp(message.createdAt);
  
      message.channel.send(lEmbed);
    }
  },
  logo: {
    name: "logo",
    desc: "See the Mitcoin logo",
    run: (message, args) => {
      // Rich embed to send the logo in
      let logoEmbed = new Discord.RichEmbed()
      .setTitle("Don't Delay. Invest Today!")
      .setColor("ff9900")
      .setImage("https://media.discordapp.net/attachments/385158866729566219/424363072472219649/unknown.png");
  
      message.channel.send(logoEmbed);
    }
  },
  reset: {
    name: "reset",
    run: (message, args) => {
      // Check if the user is a Mitcoin executive
      if (!executives.includes(message.author.id)) return message.channel.send("You don't have the permissions.");
  
      // If the user doesn't specify what to reset
      if (!args[0]) return message.channel.send("Specify what to reset");
  
      // If the argument given is not valid
      if (args[0] !== "value" && args[0] !== "balances" && args[0] !== "all") return message.channel.send("Reset either `value`, `balances`, or `all`")
      
      // Reset the value
      if (args[0] === "value" || args[0] === "all") {
          mitcoinInfo.value = 1;
          mitcoinInfo.history = [];
      }
      // Reset the balances
      if (args[0] === "balances" || args[0] === "all") {
          mitcoinInfo.balances = {};
          sales = {};
          investments = {};
      }
      
      // Send the confirmation message
      if (args[0] !== "all") return message.channel.send(`Mitcoin ${args[0]} reset.`);
      message.channel.send("Mitcoin value and balances reset.");
    }
  },
  sell: {
    name: "sell",
    desc: "Sell Mitcoin in return for money",
    run: (message, args) => {
      if (mitcoinInfo.blacklist.includes(message.author.id)) return message.reply("you are blacklisted from using Mitcoin");

      // If the user doesn't have any Mitcoin
      if (mitcoinInfo.balances[message.author.id].balance === 0) return message.reply("you don't have any Mitcoin!");
      
      // If no amount is specified
      if (!args[0]) return message.channel.send("Specify an amount to sell");
      
      let sellAmount = parseFloat(args[0]).toFixed(3);
      if (args[0].toLowerCase() === "all") sellAmount = mitcoinInfo.balances[message.author.id].balance;
  
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
  
      // Send the confirmation message
      message.channel.send(`${message.author} has sold ${Math.round(sellAmount * 1000) / 1000} ${MTC} and recieved ${(sellAmount * mitcoinInfo.value).toFixed(2)} :dollar:`);
    }
  },
  uptime: {
    name: "uptime",
    run: (message, args) => {
      let uptimeMsg = "";
      
      if (uptime >= 86400000) uptimeMsg += `${Math.floor(uptime / 86400000)}d, `;
      if (uptime >= 3600000) uptimeMsg += `${Math.floor((uptime % 86400000) / 3600000)}h, `;
      if (uptime >= 60000) uptimeMsg += `${Math.floor((uptime % 3600000) / 60000)}m, `;
      uptimeMsg += `${(uptime % 60000) / 1000}s`;
      
      message.channel.send(`BOT UPTIME: \`${uptimeMsg}\``);
    }
  },
  value: {
    name: "value",
    desc: "See Mitcoin's current value",
    run: (message, args) => {
    // Send the message saying Mitcoin's value
    message.channel.send(`1 ${MTC} is currently worth about ${mitcoinInfo.value.toFixed(3)} :dollar:`);
    }
  }
}

// How much each user has invested for the day
let investments = {};

// How much each user has paid another user for the day
let payments = {};

// How much each user has sold for the day
let sales = {};

// How many complaints each user has made for the day
let complaints = {};

// When a message is sent
bot.on("message", async message => {
  // Ignore the message if it is sent by a bot
  if (message.author.bot) return;
  // Ignore the message if it is send in DM
  if (message.channel.type === "dm") return;
  
  // Mitcoin file to compare later
  let oldMitcoinInfo = fs.readFileSync("./mitcoininfo.json", {encoding: "UTF-8"});

  // Set up what the Mitcoin file has
  mitcoinInfo = {
    value: mitcoinInfo.value || 1,
    balances: mitcoinInfo.balances || {},
    blacklist: mitcoinInfo.blacklist || [],
    history: mitcoinInfo.history || []
  }

  // If the user doesn't have a Mitcoin balance yet, set it up
  if (!mitcoinInfo.balances[message.author.id]) mitcoinInfo.balances[message.author.id] = {
    balance: 0,
    money: 1
  }
  
  // Set up the user's daily investments
  if (!investments[message.author.id]) investments[message.author.id] = {invested: 0};

  // Bot commands prefix
  let prefix = botconfig.prefix;
  
  // Ignore the message if it doesn't start with the prefix
  if (!message.content.startsWith(prefix)) return;
  
  // Get different parts of the message
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  
  // If the message is a command, run the command
  if (message.content.startsWith(prefix)) {
    for (let i in commands) {
      if (commands[i].name === cmd.slice(prefix.length)) commands[i].run(message, args);
    }
  }

  // See if mitcoinInfo balances have changed
  if (JSON.stringify(mitcoinInfo) !== oldMitcoinInfo) {
    // Channel to send logs to
    let logChannel = bot.channels.find("id", "446758326035021824");
    // Send the current Mitcoin info
    for (let i = 0; i < JSON.stringify(mitcoinInfo).length; i += 2000) logChannel.send(JSON.stringify(mitcoinInfo).substr(i, 2000));
    // Save the Mitcoin file
    fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));
  }
  
  if (cmd.slice(prefix.length) === "eval") {
    if (message.author.id !== executives[0]) return;
    let code = args.slice(0).join(" ");
    try {
        await eval(code);
    } catch(e) {
        message.channel.send("`" + e.toString() + "`");
    }
  }
});

// Log in to the Discord bot
bot.login(process.env.BOT_TOKEN);
