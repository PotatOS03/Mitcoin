// Bot setup
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const bot = new Discord.Client({disableEveryone: true});

// Mitcoin value and all user balances
let mitcoinInfo = require("./mitcoininfo.json");

// Mitcoin executives PotatOS and Mitrue
let executives = ["286664522083729409", "365444992132448258"];

// How many milliseconds it takes for Mitcoin's value to automatically fluctuate
let fluctuationTime = ms("10m");

// Automatically fluctuate Mitcoin's value
setInterval(function() {
  let fluctuation = Math.round(Math.random() * 10 - 5);
  
  // Change Mitcoin's value
  mitcoinInfo.value *= (fluctuation + 100) / 100;
  mitcoinInfo.history.push(mitcoinInfo.value);
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
      .addField("Mitcoin", `${MTCBal.toFixed(3)} <:MTC:449007845954945026>`, true)
      .addField("Equivalent value", `${(mitcoinInfo.value * MTCBal).toFixed(2)} :dollar:`, true)
      .addField("Money", `${mitcoinInfo.balances[balUser.id].money.toFixed(2)} :dollar:`)
  
      message.channel.send(balEmbed);
    }
  },
  change: {
    name: "change",
    desc: "View how much Mitcoin's value has changed over time",
    run: (message, args) => {
      if (!args[0]) return message.channel.send("Specify a time");
      let time = args.join(" ");
      if (time.toLowerCase() === "all") time = mitcoinInfo.history.length * fluctuationTime;
      if (!ms(time)) return message.channel.send("Specify a valid time");

      if (mitcoinInfo.history.length < ms(time) / fluctuationTime) time = mitcoinInfo.history.length * fluctuationTime;
      if (time / time !== 1) time = ms(time);
      time = Math.floor(time / fluctuationTime) * fluctuationTime;

      let timeString = "";
      if (time >= 86400000) timeString += `${Math.floor(time / 86400000)}d, `;
      if (time >= 3600000) timeString += `${Math.floor((time % 86400000) / 3600000)}h, `;
      if (time >= 60000) timeString += `${Math.floor((time % 3600000) / 60000)}m, `;
      timeString += `${(time % 60000) / 1000}s`;
      

      let changeEmbed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setTitle(`Mitcoin change over the past ${timeString}`)
      .addField(`${time / fluctuationTime - 1} fluctuations`, `${(mitcoinInfo.value / mitcoinInfo.history[mitcoinInfo.history.length - time / fluctuationTime]).toFixed(3)}%`)

      message.channel.send(changeEmbed);
    }
  },
  give: {
    name: "give",
    desc: "Give a user an amount of Mitcoin",
    run: (message, args) => {
      // If the user doesn't have any Mitcoin to pay
      if (mitcoinInfo.balances[message.author.id].balance === 0) return message.reply("you don't have any Mitcoin!");

      // If no user is specified to pay to
      if (!args[0]) return message.channel.send("Specify a user to pay");
  
      // First user that is mentioned
      let payUser = message.mentions.members.first();
      if (!payUser || payUser.user.bot) return message.channel.send("Specify a valid user");
      if (payUser === message.member) return message.channel.send("You can't pay yourself!");
  
      // If no amount is specified
      if (!args[1]) return message.channel.send("Specify an amount to pay");
  
      let payAmount = parseFloat(args[1]).toFixed(3);
      if (args[1].toLowerCase() === "all") payAmount = mitcoinInfo.balances[message.author.id].balance;
  
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
      mitcoinInfo.balances[payUser.id].balance += parseFloat(payAmount);
      console.log(payAmount.toString())
  
      // Send the confirmation message
      message.channel.send(`${message.author} has given ${payAmount} <:MTC:449007845954945026> to ${payUser}`);
    }
  },
  giveaway: {
    name: "giveaway",
    run: (message, args) => {
      if (!executives.includes(message.author.id)) return;

      if (!args[0]) return message.channel.send("Specify a range of values");
      let min = parseFloat(args[0]);
      let max = parseFloat(args[1]) || min;
      if (!min || !max) return message.channel.send("Specify a valid range");

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
  
      let winAmount = Math.random().toFixed(2) * (max - min) + min;
  
      mitcoinInfo.balances[winMember.id].balance += winAmount;
  
      message.channel.send(`Congratulations to ${winMember.toString()}! You have just earned a free ${winAmount} <:MTC:449007845954945026>, which is about ${(winAmount * mitcoinInfo.value).toFixed(2)} :dollar:`);
    }
  },
  help: {
    name: "help",
    run: (message, args) => {
      let executivesText = "";
      for (let i = 0; i < executives.length - 1; i++) {
        executivesText += `<@${executives[i]}> (${bot.users.find("id", executives[i]).username}), `;
      }
      executivesText += `<@${executives[executives.length - 1]}> (${bot.users.find("id", executives[executives.length - 1]).username})`;

      let helpEmbed = new Discord.RichEmbed()
      .setDescription("List of commands")
      .setColor("ff9900")
      .addField("Prefix", botconfig.prefix)
      for (let i in commands) {
        if (commands[i].desc) helpEmbed.addField(commands[i].name, commands[i].desc)
      }
      helpEmbed.addField("How to invest", `Simply type 💵 in the chat up to 3 times to invest in Mitcoin\n\nTips to Mitcoin executive${(executives.length > 1) ? "s" : ""} ${executivesText} are greatly appreciated`)
      
      message.channel.send(helpEmbed);
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
      message.channel.send(`${message.author} has sold ${Math.round(sellAmount * 1000) / 1000} <:MTC:449007845954945026> and recieved ${(sellAmount * mitcoinInfo.value).toFixed(2)} :dollar:`);
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
    message.channel.send(`1 <:MTC:449007845954945026> is currently worth about ${mitcoinInfo.value.toFixed(3)} :dollar:`);
    }
  }
}

// How much each user has invested for the day
let investments = {};

// How much each user has paid another user for the day
let payments = {};

// How much each user has sold for the day
let sales = {};

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
    history: mitcoinInfo.history || []
  }

  // If the user doesn't have a Mitcoin balance yet, set it up
  if (!mitcoinInfo.balances[message.author.id]) mitcoinInfo.balances[message.author.id] = {
    balance: 0,
    money: 1
  }
  
  // Set up the user's daily investments
  if (!investments[message.author.id]) investments[message.author.id] = {invested: 0};
  
  // The maximum amount that can be invested daily
  let dailyInvest = 10;

  // Bot commands prefix
  let prefix = botconfig.prefix;
  
  // Ignore the message if it doesn't start with the prefix
  if (!message.content.startsWith(prefix)) {
    // If the user invests using the dollar emoji
    if (message.content.split(/💵| /).length - 1 === (message.content.length + message.content.split(" ").length - 1) / 2 && message.content.length > 0) {
      // Calculate how much was invested
      let investAmount = message.content.split("💵").length - 1;
      
      if (investAmount > 3) message.reply("you can only invest in 1, 2, or 3 :dollar: at a time");
      else if (investAmount > mitcoinInfo.balances[message.author.id].money) message.reply("you don't have enough :dollar:");
      else {      
        
        // If the user has already reached their daily investment limit
        if (investments[message.author.id].invested + investAmount > dailyInvest) message.reply(`you can only invest ${dailyInvest} :dollar: per day`)
        else {
          // Wait a day after the user invested to let them invest again
          setTimeout(function() {
            investments[message.author.id].invested -= investAmount;
            if (investments[message.author.id].invested + investAmount === dailyInvest) message.reply("you may invest again!");
          }, 86400000);
          
          // Add the invested amount to the user's daily investments
          investments[message.author.id].invested += investAmount;
          
          // Add the invested amount to the user's balance
          mitcoinInfo.balances[message.author.id].balance += investAmount / mitcoinInfo.value;
          mitcoinInfo.balances[message.author.id].money -= investAmount;
          
          // Send the message
          if (mitcoinInfo.balances[message.author.id].money >= 1) message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value).toFixed(3)} <:MTC:449007845954945026> after investing ${investAmount} :dollar: and has ${(mitcoinInfo.balances[message.author.id].money).toFixed(2)} :dollar: left to invest`);
          else message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value).toFixed(3)} <:MTC:449007845954945026> after investing ${investAmount} :dollar: and cannot invest any more :dollar:`);
        }
      }
    }
  }
  
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
  
  if (message.content.startsWith(`${prefix}eval`)) {
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
