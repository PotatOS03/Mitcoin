// Bot setup
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./commands", (err, files) => {

  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if (jsfile.length <= 0) {
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    bot.commands.set(props.help.name, props);
    console.log(`${f} loaded!`);
  });

});

var SimplexNoise = function(r) {
    if (r == undefined) r = Math;
    
    this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
    this.p = [];
    for (var i=0; i<256; i++) {
        this.p[i] = Math.floor(r.random()*256);
    }
    // To remove the need for index wrapping, double the permutation table length 
    this.perm = []; 
    for(var i=0; i<512; i++) {
       this.perm[i]=this.p[i & 255];
    } 

  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  this.simplex = [ 
    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
};
SimplexNoise.prototype.dot = function(g, x, y) { 
  return g[0]*x + g[1]*y;
};
SimplexNoise.prototype.noise = function(xin, yin) { 
  var n0, n1, n2; // Noise contributions from the three corners 
  // Skew the input space to determine which simplex cell we're in 
  var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
  var s = (xin+yin)*F2; // Hairy factor for 2D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var G2 = (3.0-Math.sqrt(3.0))/6.0; 
  var t = (i+j)*G2; 
  var X0 = i-t; // Unskew the cell origin back to (x,y) space 
  var Y0 = j-t; 
  var x0 = xin-X0; // The x,y distances from the cell origin 
  var y0 = yin-Y0; 
  // For the 2D case, the simplex shape is an equilateral triangle. 
  // Determine which simplex we are in. 
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
  if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
  else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
  // c = (3-sqrt(3))/6 
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
  var y1 = y0 - j1 + G2; 
  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
  var y2 = y0 - 1.0 + 2.0 * G2; 
  // Work out the hashed gradient indices of the three simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var gi0 = this.perm[ii+this.perm[jj]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
  var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
  // Calculate the contribution from the three corners 
  var t0 = 0.5 - x0*x0-y0*y0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
  } 
  var t1 = 0.5 - x1*x1-y1*y1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
  }
  var t2 = 0.5 - x2*x2-y2*y2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to return values in the interval [-1,1]. 
  return 70.0 * (n0 + n1 + n2); 
};

// Automatically fluctuate Mitcoin's value
let interval = new SimplexNoise();
let valueTimer = 0;
setInterval(function() {
  valueTimer++;
  let simplex = interval.noise(valueTimer * 1, 0.5);
  let fluctuation = Math.round((simplex + 1) / 2 * 50 - 20);

  let mitcoinInfo = require("./mitcoininfo.json");

  // Change Mitcoin's value
  mitcoinInfo.value *= (fluctuation + 100) / 100;
  bot.user.setActivity(`MTC Value: ${Math.round(mitcoinInfo.value * 100) / 100} | m/help`);
  
  fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));
}, 600000);

// When the bot is loaded
bot.on("ready", async () => {
  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);
  let mitcoinInfo = require("./mitcoininfo.json");
  bot.user.setActivity(`MTC Value: ${Math.round(mitcoinInfo.value * 100) / 100} | m/help`);
  
  let PotatOS = bot.users.find("id", "286664522083729409");
  PotatOS.send("Update mitcoininfo!");
});

// How much each user has invested for the day
let investments = {};

// When a message is sent
bot.on("message", async message => {
  // Ignore the message if it is sent by a bot
  if (message.author.bot) return;
  // Ignore the message if it is send in DM
  if (message.channel.type === "dm") return;

  // File for Mitcoin value and all user balances
  let mitcoinInfo = require("./mitcoininfo.json");

  // Set up what the Mitcoin file has
  mitcoinInfo = {
    value: mitcoinInfo.value || 1,
    balances: mitcoinInfo.balances || {}
  }

  // If the user doesn't have a Mitcoin balance yet, set it up
  if (!mitcoinInfo.balances[message.author.id]) mitcoinInfo.balances[message.author.id] = {
    balance: 0,
    money: 1
  }
  
  // Get different parts of the message
  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  
  let logChannel = bot.channels.find("id", "446758326035021824");

  // Set up the user's daily investments
  if (!investments[message.author.id]) investments[message.author.id] = {invested: 0};
  
  // The maximum amount that can be invested daily
  let dailyInvest = 10;
  
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
          if (mitcoinInfo.balances[message.author.id].money >= 1) message.channel.send(`${message.author} has earned ${Math.round(investAmount / mitcoinInfo.value * 100) / 100} <:MTC:449007845954945026> after investing ${investAmount} :dollar: and has ${Math.round(mitcoinInfo.balances[message.author.id].money * 100) / 100} :dollar: left to invest`);
          else message.channel.send(`${message.author} has earned ${Math.round(investAmount / mitcoinInfo.value * 100) / 100} <:MTC:449007845954945026> after investing ${investAmount} :dollar: and cannot invest any more :dollar:`);

          logChannel.send(JSON.stringify(mitcoinInfo));
        }
      }
    }
  }
  // Save the Mitcoin file
  fs.writeFileSync("./mitcoininfo.json", JSON.stringify(mitcoinInfo));
  
  // If the message is a command, run the command
  if (message.content.startsWith(prefix)) {
    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args);
  }

  if (message.content.startsWith(`${prefix}eval`)) {
    if (message.author.id !== "286664522083729409") return;
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
