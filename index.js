/**
 * MITCOIN BOT
 * Made by Mitrue and PotatOS
 * A Discord bot that simulates a cryptocurrency
 * Users can invest, sell, and give MTC as the value changes in order to increase their overall balance
 * Mitcoin value, all user balances, all users in the blacklist, and a history of past values are stored in a database automatically
 * Blacklisted users are not allowed to participate in the Mitcoin economy, but can still use commands to view information
 * 
 * COMMANDS - Everyone can use
 * balance     - Check your balance in Mitcoin
 * change      - View how much Mitcoin's value has changed over time
 * complain    - Send a formal complaint to the Mitcoin executives
 * give        - Give a user an amount of Mitcoin
 * graph       - Display a graph of recent Mitcoin values
 * help        - Show a list of commands
 * invest      - Invest in a certain amount of Mitcoin
 * invite      - Join Mitcoin's server or invite the bot
 * leaderboard - View the current Mitcoin leaderboard
 * logo        - See the Mitcoin logo
 * sell        - Sell Mitcoin in return for money
 * uptime      - See how long the bot has been running
 * value       - See Mitcoin's current value
 * 
 * COMMANDS - Executives only
 * blacklist - View, add to, or remove from the blacklist
 * giveaway  - Hold a Mitcoin giveaway where a random user is given an amount of MTC at the end
 * reset     - Reset Mitcoin's value to 1 or reset all user balances
 * 
 * Don't Delay. Invest Today!
 * 
 * TO DO
 * Redo the comments to accurately fit what is happening in the code
 * Add DM commands
 * Add events for the Mitcoin server
 */

// Bot setup
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const bot = new Discord.Client({disableEveryone: true});

// For errors
require("longjohn");

// Connect to the database
const { Client } = require("pg");

const client = new Client({
  connectionString: `${botconfig.connectionURL || process.env.DATABASE_URL}?ssl=true`
})
client.connect();

// Set up Mitcoin information
let mitcoinInfo = {
  value: 1,
  balances: {},
  blacklist: [],
  history: []
};

// Load Mitcoin information from the database
client.query("SELECT * FROM value", (err, res) => {
  mitcoinInfo.value = (res.rows[0].value);
})
/*client.query("SELECT * FROM balances", (err, res) => {
  res.rows.forEach(b => {
    mitcoinInfo.balances[b.id] = {
      balance: b.mitcoin,
      money: b.money
    }
  })
})*/
mitcoinInfo.balances = {"210202479164522496":{"balance":0,"money":1},"428285467549630487":{"balance":0,"money":1},"212011192820957184":{"balance":3.17606,"money":0},"358375189458976771":{"balance":0,"money":1},"413761181275389953":{"balance":0,"money":1},"276167021815791617":{"balance":0,"money":1},"484039049473032207":{"balance":0,"money":1},"325069847736221708":{"balance":0,"money":1},"389904302757642250":{"balance":0,"money":1},"452201135210496011":{"balance":0,"money":1},"485555706804830208":{"balance":0,"money":2.33628},"394168115921158145":{"balance":0,"money":1},"429373737549299724":{"balance":0,"money":1},"486945264821600277":{"balance":0,"money":1},"384039257058050048":{"balance":0,"money":1},"487433092693360640":{"balance":0,"money":1},"427970563395420162":{"balance":0,"money":1},"163437468522250240":{"balance":0,"money":1},"491322224460955661":{"balance":0,"money":1},"213840551059914753":{"balance":0,"money":1},"211220824265326594":{"balance":0,"money":1},"481876944233693184":{"balance":0,"money":1},"492102413797556244":{"balance":0,"money":1},"449348071957069856":{"balance":0,"money":1},"492483225328025600":{"balance":0,"money":1},"246083561986326530":{"balance":0,"money":1},"492492367904112650":{"balance":0,"money":1},"492845971722600449":{"balance":0,"money":1},"486222324165771266":{"balance":0,"money":1},"249101777289347072":{"balance":0,"money":1},"493938577978163210":{"balance":0,"money":1},"328641116884959235":{"balance":1.0101,"money":0},"245227251925385217":{"balance":0,"money":1},"343534823228571659":{"balance":1,"money":0},"474703610538885122":{"balance":0.001,"money":1},"320654624556056586":{"balance":0.819103,"money":0.001999},"286870380516212747":{"balance":0,"money":1},"118540898236628993":{"balance":0,"money":1},"366447970272542731":{"balance":0,"money":1},"429389648360636419":{"balance":0,"money":1},"153639013545279488":{"balance":0,"money":1},"286664522083729409":{"balance":12.5222,"money":0},"428325571861413889":{"balance":1.05219,"money":0},"218397146049806337":{"balance":0,"money":1},"325070981158928393":{"balance":2.50084,"money":0},"284799940843274240":{"balance":0,"money":1},"460812404666662913":{"balance":0,"money":1},"230450518915416067":{"balance":1.53408,"money":0},"150463430430687233":{"balance":0.002,"money":1},"345282003328958464":{"balance":1.58282,"money":0},"270997352939126794":{"balance":0,"money":1},"295995265037631500":{"balance":53.9321,"money":0},"365444992132448258":{"balance":9.9956,"money":0},"408092142557462538":{"balance":1.01379,"money":0},"439076109678805004":{"balance":0,"money":1},"198942810571931649":{"balance":1.80688,"money":0},"188350841600606209":{"balance":1.12415,"money":0},"221285118608801802":{"balance":0,"money":1},"134800705230733312":{"balance":0,"money":1},"358316213870395392":{"balance":2.82708,"money":0},"402882532171055112":{"balance":1.03057,"money":0},"393472861001613312":{"balance":0,"money":1},"316719380811612162":{"balance":0,"money":3.93422},"453645055916244992":{"balance":0,"money":1},"429686318528856074":{"balance":1.86008,"money":0},"322803239563296768":{"balance":0,"money":1},"407674114384461835":{"balance":0,"money":3.11521},"344629561641926658":{"balance":0,"money":1},"467442833498832896":{"balance":0,"money":1},"420372167969210378":{"balance":0,"money":1},"477533272650547224":{"balance":0,"money":1},"385488500440694784":{"balance":0,"money":1},"428984163576578089":{"balance":0,"money":1},"158776870148636683":{"balance":0,"money":1},"402518087653392447":{"balance":1.24825,"money":0},"424163977384165376":{"balance":0,"money":1},"411139755057610752":{"balance":0,"money":1},"244115531160879107":{"balance":0,"money":1},"309845156696424458":{"balance":3.47991,"money":0},"461522449029136385":{"balance":0,"money":1},"306614889194192897":{"balance":0,"money":1},"163973930187489280":{"balance":0,"money":1},"226816693236793344":{"balance":0,"money":1},"416802709484732417":{"balance":0,"money":1},"237598245596037120":{"balance":0,"money":1},"199198825091563520":{"balance":0,"money":1},"265597906701123584":{"balance":0,"money":1},"459101716470824981":{"balance":0,"money":1},"380696802627682305":{"balance":0,"money":1},"202900676202725376":{"balance":0,"money":1},"419151003766620180":{"balance":0,"money":1},"481806289740103700":{"balance":0,"money":1},"227857442103492609":{"balance":0,"money":1},"235565253952405504":{"balance":0,"money":1},"481842036639531008":{"balance":2.36664,"money":0},"482163808404635668":{"balance":0,"money":1},"423559524536811521":{"balance":0,"money":1},"249004302511767562":{"balance":0,"money":1},"479347118847295519":{"balance":0,"money":1},"432712295953596436":{"balance":0,"money":1},"442151814029115402":{"balance":0,"money":1},"370381633305575426":{"balance":0,"money":1},"451805572212195338":{"balance":0,"money":1},"480782820160307200":{"balance":0,"money":1},"226887818364846082":{"balance":0,"money":1},"402568219434680320":{"balance":1.69672,"money":2.77556e-17},"325314044527640576":{"balance":0,"money":1},"210924855481204736":{"balance":0,"money":1},"173457319248527360":{"balance":0,"money":1},"363361451777327104":{"balance":0,"money":1},"364444183492165643":{"balance":0,"money":1},"483804244445495297":{"balance":0,"money":1},"294115380916649986":{"balance":0,"money":1},"322826064705355786":{"balance":0,"money":1},"347183071449186308":{"balance":0,"money":1},"487886532812865566":{"balance":0,"money":1},"417087612222701581":{"balance":0,"money":1},"412312297852239873":{"balance":0,"money":1},"428026557353689098":{"balance":0,"money":1},"473718051939024896":{"balance":0,"money":1},"375738267682734081":{"balance":1.64354,"money":0},"211578983488290820":{"balance":0,"money":1},"410561489834082306":{"balance":2.07662,"money":0},"458843574079979530":{"balance":0,"money":1},"422081522326044692":{"balance":0,"money":1},"376513305830752256":{"balance":0,"money":1},"427266605664174100":{"balance":0,"money":1},"327022765221871616":{"balance":0,"money":1},"466683771207417857":{"balance":0,"money":1},"323988643603677185":{"balance":0,"money":1},"432984231128596480":{"balance":0,"money":1},"299150484218970113":{"balance":0,"money":1},"202997568886538241":{"balance":0,"money":1},"303892486751911940":{"balance":0,"money":1},"295327501134069760":{"balance":0,"money":1},"198934514343346176":{"balance":0,"money":1},"494236142686961664":{"balance":1.52853,"money":0},"346110467061579776":{"balance":0,"money":1},"489799705736511509":{"balance":0,"money":1},"423752077676773377":{"balance":0,"money":1},"167711491078750208":{"balance":0,"money":1},"393423147715788810":{"balance":0,"money":1}}
client.query("SELECT * FROM blacklist", (err, res) => {
  res.rows.forEach(b => {
    mitcoinInfo.blacklist.push(b.id);
  })
})
client.query("SELECT * FROM history", (err, res) => {
  res.rows.forEach(h => {
    mitcoinInfo.history.push(h.value);
  })
})

// For creating graphs
const ChartjsNode = require("chartjs-node");

// Mitcoin executives PotatOS and Mitrue
let executives = ["286664522083729409", "365444992132448258"];

// Channels
let blockchain = "481797287064895489";
let logs = "485839182170685460";

// MTC logo emoji
let MTC = "<:MTC:452553160557461544>";

// How long it takes for Mitcoin's value to automatically fluctuate
let fluctuationTime = ms("5m");

// Automatically fluctuate Mitcoin's value
setInterval(function() {
  // Calculate the random fluctuation
  let fluctuation = Math.round(Math.random() * 10 - 5 + (1 - mitcoinInfo.value) / 5);
  
  // Change Mitcoin's value
  mitcoinInfo.value *= (fluctuation + 100) / 100;
  mitcoinInfo.history.push(parseFloat(mitcoinInfo.value.toFixed(3)));
  bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(3)} | m/help`);

  // Save new value to the database
  client.query("DELETE FROM history");
  client.query(`UPDATE value SET value = ${mitcoinInfo.value}`);
  for (let i in mitcoinInfo.history) {
    if (i < 9999 - mitcoinInfo.blacklist.length - Object.keys(mitcoinInfo.balances).length) client.query(`INSERT INTO history VALUES(${i}, ${mitcoinInfo.history[i]})`);
  }
}, fluctuationTime);

// When the bot is loaded
bot.on("ready", async () => {
  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);
  bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(3)} | m/help`);
});

// Bot uptime
let uptime = 0;
setInterval(e => uptime++, 100);

// Send an alert when the bot joins a new server
bot.on("guildCreate", guild => {
  let logChannel = bot.channels.get(logs);

  let joinEmbed = new Discord.RichEmbed()
  .setThumbnail(guild.iconURL)
  .setTitle("New server joined")
  .setDescription(guild.name)
  .addField("Server owner", `${guild.owner.user.username}#${guild.owner.user.discriminator}\nID: ${guild.ownerID}`)
  .setFooter(`Server ID: ${guild.id}`)
  .addField("Invites", "None")

  // Attempt to get invites to the server
  try {
    guild.fetchInvites().then(invites => invites.forEach(i => {
      if (joinEmbed.fields[1].value === "None") joinEmbed.fields[1].value = "";
      joinEmbed.fields[1].value += `[${i.code}](https://discord.gg/${i.code} '${guild.memberCount} members')\n`;
      if (i === invites.last()) logChannel.send(joinEmbed);
    }))
  } catch(e) {
    logChannel.send(joinEmbed);
  }
})

// All bot commands
const commands = {
  balance: {
    name: "balance",
    desc: "Check your balance in Mitcoin",
    run: (message, args) => {
      // Whose balance is being shown
      let balUser = message.author;
      if (executives.includes(message.author.id)) {
        balUser = message.mentions.members.first() || bot.users.get(args[0] || message.author.id) || message.author;
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
      .addField("Equivalent value", `${(mitcoinInfo.value * MTCBal).toFixed(3)} :dollar:`, true)
      .addField("Money", `${mitcoinInfo.balances[balUser.id].money.toFixed(3)} :dollar:`)
      if (mitcoinInfo.blacklist.includes(balUser.id)) balEmbed.setFooter("You are blacklisted from using Mitcoin")
  
      message.channel.send(balEmbed);
    }
  },
  blacklist: {
    name: "blacklist",
    run: (message, args) => {
      // Executive-only command
      if (!executives.includes(message.author.id)) return;
      
      // DM the list of blacklisted users
      if (!args[0]) return message.author.send(`**List of blacklisted users:**\n${mitcoinInfo.blacklist.length > 0 ? `<@${mitcoinInfo.blacklist.join(">\n<@")}>` : "None"}`);

      let blacklistUser = bot.users.get(args[0]) || bot.users.find("username", args.join(" ")) || message.mentions.members.first();
      if (!blacklistUser) return message.channel.send(`${args.join(" ")} is not a valid user`);
      blacklistUser = blacklistUser.user || blacklistUser;

      // If the user is already blacklisted, remove them
      if (mitcoinInfo.blacklist.includes(blacklistUser.id)) {
        message.channel.send(`User: \`${blacklistUser.username}\` successfully removed from blacklist`);
        return mitcoinInfo.blacklist.splice(mitcoinInfo.blacklist.indexOf(blacklistUser.id), 1)
      }

      // Otherwise, blacklist them
      message.channel.send(`User: \`${blacklistUser.username}\` successfully added to blacklist`);
      mitcoinInfo.blacklist.push(blacklistUser.id);
    }
  },
  change: {
    name: "change",
    desc: "View how much Mitcoin's value has changed over time",
    run: (message, args) => {
      // If there is no valid time specified
      if (!args[0]) return message.channel.send("Specify a number of fluctuations");
      let time = args.join("");
      if (time.toLowerCase() === "all") time = mitcoinInfo.history.length - 1;
      if (time < 1 || !parseInt(time)) return message.channel.send("Specify a valid number of fluctuations");

      // Calculate the actual time
      if (time > mitcoinInfo.history.length - 1) time = mitcoinInfo.history.length - 1;
      time = Math.floor(time) * fluctuationTime;
      
      // Format the time
      let timeString = "";
      if (time >= 86400000) timeString += `${Math.floor(time / 86400000)} day${time > 172800000 ? "s" : ""}, `;
      if (time >= 3600000) timeString += `${Math.floor((time % 86400000) / 3600000)} hour${time % 86400000 > 7200000 ? "s" : ""}, `;
      if (time >= 60000) timeString += `${Math.floor((time % 3600000) / 60000)} minutes`;

      // Embed to show the percent change in value
      let changeEmbed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setTitle(`Mitcoin change over the past ${timeString}`)
      .addField(`${time / fluctuationTime} fluctuations`, `${Math.round(mitcoinInfo.value / mitcoinInfo.history[mitcoinInfo.history.length - time / fluctuationTime - 1] * 100)}%`)

      message.channel.send(changeEmbed);
    }
  },
  complain: {
    name: "complain",
    desc: "Send a formal complaint to the Mitcoin executives",
    run: (message, args) => {
      let complaint = args.join(" ");
      if (!complaint) return message.channel.send("Specify a message");

      // Log channel to send the complain in
      let complaintChannel = bot.channels.get(logs);

      // Send the complaint in an embed
      let complaintEmbed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .addField("New complaint", complaint)
      .setTimestamp(message.createdAt);

      // Confirm that the complain was sent successfully
      message.channel.send("✅ Your complaint has been sent and will be viewed shortly");
      complaintChannel.send(complaintEmbed);
    }
  },
  give: {
    name: "give",
    desc: "Give a user an amount of Mitcoin",
    run: (message, args) => {
      // If the user is blacklisted
      if (mitcoinInfo.blacklist.includes(message.author.id)) return message.reply("you are blacklisted from using Mitcoin");

      // If the user doesn't have any Mitcoin to pay
      if (mitcoinInfo.balances[message.author.id].balance === 0) return message.reply("you don't have any Mitcoin!");

      // If no user is specified to pay to
      if (!args[0]) return message.channel.send("Specify a user to pay");
  
      // First user that is mentioned
      let payUser = bot.users.get(args[0]) || message.mentions.members.first();
      if (!payUser) return message.channel.send("Specify a valid user");
      payUser = payUser.user || payUser;
      
      if (mitcoinInfo.blacklist.includes(payUser.id)) return message.channel.send("That user is blacklisted");
      if (payUser.bot) return message.channel.send("Specify a valid user");
      if (payUser === message.author) return message.channel.send("You can't pay yourself!");
      
      // If no amount is specified
      if (!args[1]) return message.channel.send("Specify an amount to pay");
      if (args[0] !== `<@${payUser.id}>` && args[0] !== `<@!${payUser.id}>` && args[0] !== payUser.id) return message.channel.send("Specify the member, then the number");
  
      let payAmount = parseFloat(args[1]).toFixed(3);
      if (args[1].toLowerCase() === "all") payAmount = mitcoinInfo.balances[message.author.id].balance;
  
      if (!payAmount || payAmount === "NaN" || payAmount <= 0) return message.channel.send(`Specify a valid number to pay`);
      
      // If the user has less Mitcoin than they say to pay
      if (mitcoinInfo.balances[message.author.id].balance < payAmount) return message.reply("you don't have enough Mitcoin to pay!");
  
      // If the user doesn't have a Mitcoin balance yet, set it up
      if (!mitcoinInfo.balances[payUser.id]) mitcoinInfo.balances[payUser.id] = {
          balance: 0,
          money: 1
      };
  
      // Actually calculate the payment
      mitcoinInfo.balances[message.author.id].balance -= payAmount;
      mitcoinInfo.balances[payUser.id].balance += parseFloat(payAmount);
  
      // Send the confirmation message
      message.channel.send(`${message.author} has given ${payAmount} ${MTC} to ${payUser.username}`);

      // Send it in the blockchain
      let embed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
      .addField("Given", `${payAmount} ${MTC}`)
      .addField("Equivalent Amount", `${payAmount * mitcoinInfo.value} :dollar:`)
      .addField("Recipient", `<@${payUser.id}>`)
      .setTimestamp(message.createdAt);

      bot.channels.get(blockchain).send(embed);
    }
  },
  giveaway: {
    name: "giveaway",
    run: (message, args) => {
      // Executive-only command
      if (!executives.includes(message.author.id)) return;

      // How long the giveaway will last
      if (!args[0]) return message.channel.send("Specify a time");
      time = args[0];
      if (!ms(time) || time <= 0 || ms(time) <= 0) return message.channel.send("Specify a valid time");

      if (time / time === 1) time = ms(time);

      // How much Mitcoin will be given
      if (!args[1]) return message.channel.send("Specify a range of values");
      let min = parseFloat(args[1]);
      let max = parseFloat(args[2]) || min;
      if ((!min && min !== 0) || !max) return message.channel.send("Specify a valid range");
      
      // Amount can be randomly chosen
      let winAmount = Math.random().toFixed(2) * (max - min) + min;

      // Embed for users to react to
      let giveEmbed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setTitle(`New ${MTC} Giveaway!`)
      .addField(`How much MTC is available?`, winAmount)
      .addField("To enter the giveaway", `React to this message with the ${MTC} emoji`)
      .setTimestamp(message.createdAt)
      .setFooter(`This giveaway will end in ${time}`)
      
      // React using the MTC emoji
      message.delete();
      message.channel.send(giveEmbed).then(msg => {
        msg.react(MTC.split(/:|>/)[2]);

        // After the giveaway has ended
        setTimeout(function() {
          msg.delete();

          // Determine who reacted to the message
          let reacters = msg.reactions.get(MTC.split(/<:|>/)[1]);

          // Choose a random winner
          let winner = Math.floor(Math.random() * reacters.count);

          // Find which user was the random winner
          let winUser = 0;
          reacters.users.forEach(r => {
            if (!r.bot && winner <= 0 && winUser === 0) winUser = r;
            winner--;
          })
          
          // If no one reacted
          if (winUser === 0) return message.channel.send("**No one reacted to the giveaway!**\n__Make sure to react before the time runs out.__");

          // If the winner doesn't have a Mitcoin balance yet, set it up
          if (!mitcoinInfo.balances[winUser.id]) mitcoinInfo.balances[winUser.id] = {
            balance: 0,
            money: 1
          }
      
          // Give the winner their Mitcoin
          mitcoinInfo.balances[winUser.id].balance += winAmount;

          // Show the giveaway in a new embed
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
    desc: "Display a graph of recent Mitcoin values",
    run: async (message, args) => {
      // If there isn't any history and thus nothing to display
      if (mitcoinInfo.history.length <= 0) return message.channel.send("There is no value history yet!");

      // The maximum amount of fluctuations that can be shown
      let maxFluctuations = 2000;

      // How many fluctuations to be shown
      if (args[0] && (!parseInt(args[0]) || args[0] < 1)) return message.channel.send("Specify a valid number of fluctuations");
      let fluctuations = Math.min(Math.floor(args[0]) || maxFluctuations, maxFluctuations);
      if (fluctuations > mitcoinInfo.history.length - 1) fluctuations = mitcoinInfo.history.length - 1;

      // Find the data in Mitcoin value history
      let data = mitcoinInfo.history.slice();
      data.splice(0, data.length - fluctuations - 1)
      let labels = [];
      for (let i in data) labels.push(i);

      // Create the graph using ChartJS
      let chartNode = new ChartjsNode(1000, 600);
      return chartNode.drawChart({
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: "Value",
            data: data,
            borderColor: "#ff9900",
            pointRadius: 0,
            lineTension: 0,
            fill: false
          }],
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              gridLines: {
                color: "rgba(174, 175, 177, 0.5)"
              },
              ticks: {
                display: false,
                maxTicksLimit: 10
              }
            }],
            yAxes: [{
              gridLines: {
                color: "#aeafb1",
                drawTicks: false
              },
              ticks: {
                padding: 12,
                autoSkipPadding: 32,
                fontColor: "#aeafb1",
                fontFamily: "Helvetica",
                fontSize: 24,
                suggestedMin: mitcoinInfo.value,
                suggestedMax: mitcoinInfo.value,
                stepSize: 0.1,
              }
            }]
          }
        }
      })
      .then(() => {
        return chartNode.getImageBuffer('image/png');
      })
      .then(buffer => {
        Array.isArray(buffer)
        return chartNode.getImageStream('image/png');
      })
      .then(streamResult => {
        streamResult.stream
        streamResult.length
        return chartNode.writeImageToFile('image/png', './mtcgraph.png');
      })
      .then(() => {
        // Format the time
        let time = fluctuations * fluctuationTime;
        let timeString = "";
        if (time >= 86400000) timeString += `${Math.floor(time / 86400000)} day${time > 172800000 ? "s" : ""}, `;
        if (time >= 3600000) timeString += `${Math.floor((time % 86400000) / 3600000)} hour${time % 86400000 > 7200000 ? "s" : ""}, `;
        if (time >= 60000) timeString += `${Math.floor((time % 3600000) / 60000)} minutes`;

        // Create an embed with the graph
        let embed = {
          "color": 0xFF9900,
          "description": `Mitcoin value over the past ${data.length - 1} fluctuations (${timeString})`,
          "image": {
            "url": "attachment://mtcgraph.png"
          },
          "timestamp": message.createdAt
        };

        // Send the embed using the newly created file
        message.channel.send({
          embed,
          files: [{
            attachment: './mtcgraph.png',
            name: 'mtcgraph.png'
          }]
        });

        // Destroy the chart instance so the command can be used again
        chartNode.destroy();
      });
    }
  },
  help: {
    name: "help",
    run: (message, args) => {
      // Create an embed with all user commands
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
      // If the user is blacklisted
      if (mitcoinInfo.blacklist.includes(message.author.id)) return message.reply("you are blacklisted from using Mitcoin");
      
      if (mitcoinInfo.balances[message.author.id].money < 0.01) return message.reply("you can't invest in any Mitcoin!")
      if (!args[0]) return message.channel.send("Specify an amount to invest");

      // How much to invest
      let investAmount = parseFloat(args[0]);
      if (args[0].toLowerCase() === "all") investAmount = mitcoinInfo.balances[message.author.id].money;

      if (!investAmount || investAmount < 0.01) return message.channel.send("Specify a valid amount to invest");
      
      if (investAmount > mitcoinInfo.balances[message.author.id].money) return message.reply("you don't have enough :dollar:");

      // How many times today the user has invested
      if (!investments[message.author.id]) investments[message.author.id] = {
        invested: 0
      };

      // Daily invest limit
      if (investments[message.author.id].invested > 1) return message.reply("you can only invest twice per day");
      investments[message.author.id].invested++;
      setTimeout(function() {
          investments[message.author.id].invested--;
          if (investments[message.author.id].invested > 0) message.reply("you may invest again!");
      }, 86400000);
      
      // Add the invested amount to the user's balance
      mitcoinInfo.balances[message.author.id].balance += investAmount / mitcoinInfo.value;
      mitcoinInfo.balances[message.author.id].money -= investAmount;
      
      // Send the message
      if (mitcoinInfo.balances[message.author.id].money > 0) return message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value).toFixed(3)} ${MTC} after investing ${investAmount.toFixed(2)} :dollar: and has ${(mitcoinInfo.balances[message.author.id].money).toFixed(2)} :dollar: left to invest`);
      message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value).toFixed(3)} ${MTC} after investing ${investAmount.toFixed(2)} :dollar: and cannot invest any more :dollar:`);

      // Send it in the blockchain
      let embed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
      .addField("Invested", `${investAmount} :dollar:`)
      .addField("Equivalent Amount", `${investAmount / mitcoinInfo.value} ${MTC}`)
      .setTimestamp(message.createdAt);
      
      bot.channels.get(blockchain).send(embed);
    }
  },
  invite: {
    name: "invite",
    //desc: "Join Mitcoin's server or invite the bot",
    run: (message, args) => {
      // How many humans are in the Mitcoin server
      let serverMembers = 0;
      bot.guilds.get("424284908991676418").members.forEach(member => {
        if (!member.user.bot) serverMembers++;
      })

      // Send an embed for Mitcoin Bot's OAuth link and Mitcoin server invite
      let inviteEmbed = new Discord.RichEmbed().setColor("ff9900").addField("Invite Mitcoin Bot", `Not yet implemented`).addField("Official Mitcoin Server", `Not yet implemented`);
      //message.channel.send(inviteEmbed);
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
      // If the user is blacklisted
      if (mitcoinInfo.blacklist.includes(message.author.id)) return message.reply("you are blacklisted from using Mitcoin");

      // If the user doesn't have any Mitcoin
      if (mitcoinInfo.balances[message.author.id].balance === 0) return message.reply("you don't have any Mitcoin!");
      
      // If no amount is specified
      if (!args[0]) return message.channel.send("Specify an amount to sell");
      
      let sellAmount = parseFloat(args[0]).toFixed(3);
      if (args[0].toLowerCase() === "all") sellAmount = mitcoinInfo.balances[message.author.id].balance;
  
      if (!sellAmount || sellAmount <= 0 || sellAmount === "NaN") return message.channel.send(`Specify a valid number to sell`);
      
      // If the user has less Mitcoin than they say to pay
      if (mitcoinInfo.balances[message.author.id].balance < sellAmount) return message.reply("you don't have enough Mitcoin to sell!");
  
      // Set up for daily cooldown
      if (!sales[message.author.id]) sales[message.author.id] = {
          sales: 0
      }
      
      // Daily sell limit
      if (sales[message.author.id].sales > 1) return message.reply("you can only sell twice per day");
      sales[message.author.id].sales++;
      setTimeout(function() {
          sales[message.author.id].sales--;
          if (sales[message.author.id].sales > 0)
          message.reply("you may sell again!");
      }, 86400000);
  
      // Actually calculate the sale
      mitcoinInfo.balances[message.author.id].balance -= sellAmount;
      mitcoinInfo.balances[message.author.id].money += sellAmount * mitcoinInfo.value;
  
      // Send the confirmation message
      message.channel.send(`${message.author} has sold ${Math.round(sellAmount * 1000) / 1000} ${MTC} and recieved ${(sellAmount * mitcoinInfo.value).toFixed(2)} :dollar:`);

      // Send it in the blockchain
      let embed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
      .addField("Sold", `${sellAmount} ${MTC}`)
      .addField("Equivalent Amount", `${sellAmount * mitcoinInfo.value} :dollar:`)
      .setTimestamp(message.createdAt);

      bot.channels.get(blockchain).send(embed);
    }
  },
  uptime: {
    name: "uptime",
    run: (message, args) => {
      let uptimeMsg = "";

      // Format the time
      if (uptime >= 864000) uptimeMsg += `${Math.floor(uptime / 864000)} day${uptime > 1728000 ? "s" : ""}, `;
      if (uptime >= 36000) uptimeMsg += `${Math.floor((uptime % 864000) / 36000)} hour${uptime % 864000 > 72000 ? "s" : ""}, `;
      if (uptime >= 600) uptimeMsg += `${Math.floor((uptime % 36000) / 600)} minute${uptime % 36000 > 1200 ? "s" : ""}, `;
      uptimeMsg += `${(uptime % 600) / 10} seconds`;
      
      message.channel.send(`BOT UPTIME: \`${uptimeMsg}\``);
    }
  },
  value: {
    name: "value",
    desc: "See Mitcoin's current value",
    run: (message, args) => {
    // Calculate the value of a specific amount
    if (parseFloat(args[0]) && parseFloat(args[0]) > 0) return message.channel.send(`${args[0]} ${MTC} is currently worth about ${(mitcoinInfo.value * args[0]).toFixed(3)} :dollar:`);

    // Send the message saying Mitcoin's value
    message.channel.send(`1 ${MTC} is currently worth about ${mitcoinInfo.value.toFixed(3)} :dollar:`);
    }
  }
}

// If the bot encounters an error
bot.on('error', console.error);

// How many times each user has invested for the day
let investments = {};

// How many times each user has sold for the day
let sales = {};

// When a message is sent
bot.on("message", async message => {
  // Ignore the message if it is sent by a bot
  if (message.author.bot) return;
  // Ignore the message if it is send in DM
  if (message.channel.type === "dm") return;
  
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
  for (let i in commands) {
    if (commands[i].name === cmd.slice(prefix.length)) commands[i].run(message, args);
    // Save the Mitcoin database
    client.query("DELETE FROM balances");
    client.query("DELETE FROM blacklist");
    client.query("DELETE FROM history");
    client.query(`UPDATE value SET value = ${mitcoinInfo.value}`);
    for (let i in mitcoinInfo.balances) {
      client.query(`INSERT INTO balances VALUES(${i}, ${mitcoinInfo.balances[i].balance}, ${mitcoinInfo.balances[i].money})`);
    }
    for (let i in mitcoinInfo.blacklist) {
      client.query(`INSERT INTO blacklist VALUES(${mitcoinInfo.blacklist[i]})`);
    }
    for (let i in mitcoinInfo.history) {
      client.query(`INSERT INTO history VALUES(${i}, ${mitcoinInfo.history[i]})`);
    }
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
