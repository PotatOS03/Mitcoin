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
 * revive    - Revive a past giveaway if it didn't automatically end
 * 
 * Don't Delay. Invest Today!
 * 
 * TO DO
 * Add DM commands
 * Add features for the Mitcoin server
 */


// Bot setup
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const bot = new Discord.Client({disableEveryone: true});

// Some other specific things to set up
let maintenance = true; // Whether the bot is in maintenance mode
const executives = ["286664522083729409", "365444992132448258"]; // Mitcoin executives PotatOS and Mitrue
const blockchain = "481797287064895489"; // Blockchain channel ID
const logs = "485839182170685460"; // Logs channel ID
const MTC = "<:MTC:518256956214083586>"; // Mitcoin logo emoji
let fluctuationTime = ms("5m"); // How long it takes for Mitcoin's value to automatically fluctuate
let maxHistory = 1000; // Maximum number of history values to be saved

// For creating graphs
const ChartjsNode = require("chartjs-node");

// Connect to the database
const { Client } = require("pg");

const client = new Client({
  connectionString: `${botconfig.connectionURL || process.env.DATABASE_URL}`,
  ssl: true
})
client.connect();

// Set up Mitcoin information
let mitcoinInfo = {
  value: 1,
  demand: 0,
  balances: {},
  blacklist: [],
  history: []
};
mitcoinInfo = {"value":0.7311789348025881,"demand":4.074493796094751,"balances":{"449348071957069856":{"balance":0,"money":5940.598080129684},"328641116884959235":{"balance":1.0101,"money":0},"343534823228571659":{"balance":21021500,"money":32712.6},"474703610538885122":{"balance":32.260256994059844,"money":0},"320654624556056586":{"balance":24364481294861.812,"money":0},"286664522083729409":{"balance":1713056969.3414578,"money":0},"428325571861413889":{"balance":1.05219,"money":0},"325070981158928393":{"balance":1002001200.99,"money":1478.76},"230450518915416067":{"balance":1.53408,"money":0},"150463430430687233":{"balance":1000196.6280782978,"money":0},"345282003328958464":{"balance":8299.648575276935,"money":0},"270997352939126794":{"balance":1.7061,"money":0},"295995265037631500":{"balance":903189242155497000000,"money":0},"365444992132448258":{"balance":0,"money":147696784067040.1},"408092142557462538":{"balance":990081043343.4191,"money":17223006825.412228},"198942810571931649":{"balance":1.80688,"money":0},"188350841600606209":{"balance":1.12415,"money":0},"358316213870395392":{"balance":25,"money":2881.23},"402882532171055112":{"balance":1.03057,"money":0},"316719380811612162":{"balance":51.29,"money":3.93422},"429686318528856074":{"balance":0,"money":1.23611},"407674114384461835":{"balance":0.00024972856044769287,"money":0},"402518087653392447":{"balance":0,"money":1.25986},"309845156696424458":{"balance":0.00013271020725369453,"money":0},"323988643603677185":{"balance":30.9637,"money":0},"214366501686214656":{"balance":0,"money":2.36473},"499012550487441408":{"balance":0,"money":3813.583471720598},"474591598114504724":{"balance":0,"money":158.08},"375738267682734081":{"balance":37821818851240620000,"money":0},"410561489834082306":{"balance":3576.82,"money":1},"350735012523671552":{"balance":1.72585,"money":0},"212011192820957184":{"balance":1004198268.620754,"money":0},"325069847736221708":{"balance":0,"money":16.868266961425675},"485555706804830208":{"balance":0,"money":2.33628},"481842036639531008":{"balance":1058519666341060.4,"money":0},"416802709484732417":{"balance":267506312232252000,"money":0},"221285118608801802":{"balance":69.63,"money":1},"298636036135714816":{"balance":26.029210673734923,"money":0},"406567735812947970":{"balance":0,"money":2.76989},"519173093239947264":{"balance":25736.231851039687,"money":0},"374929883698036736":{"balance":0,"money":0},"167711491078750208":{"balance":7350217892518.722,"money":0},"428285467549630487":{"balance":188104933623319.62,"money":0},"477533272650547224":{"balance":3.05531,"money":0},"218397146049806337":{"balance":100007825.24746002,"money":0},"226887818364846082":{"balance":0,"money":557504276508687.3},"486222324165771266":{"balance":29,"money":0},"499817470442602496":{"balance":300,"money":3837891923191.18},"376513305830752256":{"balance":0,"money":9749436.832350608},"419151003766620180":{"balance":6969696.42,"money":0},"434540925725966336":{"balance":3.9296575838943613e+21,"money":0},"499882708860665856":{"balance":0,"money":620908.9695470027},"530157563065663498":{"balance":7598843269.287917,"money":0},"439076109678805004":{"balance":500000437012.60986,"money":0},"198590928166977537":{"balance":224.7496197906981,"money":0},"370381633305575426":{"balance":1.2003,"money":1.632898848533249},"228299593417228288":{"balance":2.3703,"money":0},"368430274587000852":{"balance":1521.8210649510588,"money":0},"469544491989336064":{"balance":15005.815033937079,"money":0},"534954063129870362":{"balance":23206266.307752542,"money":0},"236960229370232835":{"balance":1101.61,"money":0},"302676377230901250":{"balance":0,"money":5.58428},"403717771650924546":{"balance":1.20713,"money":0},"331694609681874945":{"balance":20752678.80781816,"money":0},"314108469256912897":{"balance":0.964838,"money":0},"515562864241541125":{"balance":1000001.08716,"money":0},"347183071449186308":{"balance":2028207.9635083461,"money":0},"367145946985005057":{"balance":306485.1012664421,"money":0},"268131125279457280":{"balance":0,"money":7941.519135848645},"385488500440694784":{"balance":4538215443387477,"money":0},"456220387148169236":{"balance":6001.42,"money":0},"473496535599022080":{"balance":0.000032901763916015625,"money":0},"517804746526949416":{"balance":0,"money":0},"381876228468244480":{"balance":1006282.2030743782,"money":0},"163437468522250240":{"balance":0,"money":1},"266273291604328450":{"balance":0,"money":3.330863097611623},"545136649382920192":{"balance":0,"money":49435.07436484069},"461522449029136385":{"balance":9237602.077555632,"money":1740394.6708385234},"254274910816436234":{"balance":542900.2181171969,"money":2940.7564392986824},"155655087639756800":{"balance":2.224263264657307,"money":0},"402568219434680320":{"balance":0,"money":383122292814664.9},"479398853154570241":{"balance":500,"money":1},"468811298466168852":{"balance":1.143224459548295,"money":0},"502616347822522393":{"balance":3000000,"money":1},"445804634645200896":{"balance":1000000,"money":1},"448547459300589568":{"balance":500000,"money":1},"506640037698338816":{"balance":502000,"money":1},"428245232832872448":{"balance":72898660.91006432,"money":0},"417087612222701581":{"balance":100,"money":0},"237598245596037120":{"balance":0.6002685357931322,"money":0},"258265415770177536":{"balance":1001.9271047885959,"money":0.23022645784641416},"275760286525554698":{"balance":1,"money":1},"310044671512412160":{"balance":0.8759169719723533,"money":0},"428984163576578089":{"balance":0,"money":1},"340215110784122881":{"balance":0,"money":1},"198863812055531521":{"balance":53067125.534845665,"money":0},"267306362235650049":{"balance":3374505872647750000,"money":0},"515408938670489619":{"balance":5299543.67025704,"money":0},"555190082697560064":{"balance":1.1893283983806846,"money":0},"461523415061495808":{"balance":0.9842428654597094,"money":0},"528201892531011599":{"balance":1.0202173435944588,"money":0},"557170896507371520":{"balance":0,"money":1},"554626516655538186":{"balance":1000203.5665805755,"money":0},"558418175579127838":{"balance":2402.1372041728346,"money":0},"561385369904611348":{"balance":0,"money":14090670579129.46},"538869810403213362":{"balance":1057410358598.7692,"money":0},"412673967716040714":{"balance":0,"money":1},"547809109832105984":{"balance":30943111.74819636,"money":0},"535517625443287053":{"balance":1000,"money":1},"525546554589839362":{"balance":1635333996.1792057,"money":0},"545352802755543041":{"balance":0,"money":1},"486233230924709895":{"balance":0,"money":1},"570366161640751125":{"balance":0,"money":1},"538077704038383679":{"balance":0,"money":1},"557604681824600085":{"balance":0,"money":1},"574337434356154388":{"balance":0,"money":1},"342318590214537217":{"balance":2.5307581151023064,"money":0}},"blacklist":["538869810403213362"],"history":[2.136,2.222,2.288,2.174,2.131,2.216,2.304,2.281,2.304,2.235,2.347,2.417,2.369,2.464,2.34,2.434,2.312,2.335,2.242,2.309,2.332,2.262,2.217,2.217,2.151,2.151,2.215,2.127,2.212,2.256,2.324,2.417,2.417,2.32,2.343,2.249,2.249,2.249,2.227,2.249,2.272,2.34,2.34,2.34,2.27,2.224,2.202,2.136,2.114,2.009,2.049,2.028,1.968,2.066,2.045,1.984,2.063,2.125,2.21,2.254,2.322,2.276,2.207,2.207,2.229,2.229,2.274,2.183,2.249,2.249,2.294,2.271,2.248,2.27,2.27,2.384,2.384,2.432,2.407,2.504,2.478,2.404,2.308,2.262,2.262,2.284,2.193,2.215,2.193,2.171,2.193,2.258,2.168,2.06,1.998,2.038,2.099,2.057,2.036,2.138,2.202,2.158,2.094,2.073,2.135,2.049,1.947,1.966,2.006,2.026,1.945,1.906,1.849,1.923,1.961,1.981,1.882,1.938,1.841,1.749,1.662,1.712,1.746,1.676,1.709,1.658,1.658,1.675,1.675,1.591,1.655,1.721,1.772,1.755,1.72,1.754,1.789,1.771,1.683,1.599,1.647,1.63,1.63,1.581,1.597,1.597,1.661,1.727,1.658,1.725,1.673,1.723,1.74,1.723,1.757,1.757,1.687,1.67,1.653,1.703,1.737,1.702,1.634,1.602,1.618,1.553,1.506,1.476,1.417,1.346,1.4,1.456,1.514,1.545,1.514,1.574,1.606,1.574,1.558,1.542,1.496,1.451,1.48,1.525,1.448,1.463,1.419,1.419,1.391,1.377,1.39,1.335,1.348,1.389,1.43,1.359,1.359,1.345,1.318,1.252,1.277,1.277,1.329,1.262,1.3,1.248,1.26,1.298,1.272,1.26,1.285,1.259,1.246,1.184,1.184,1.16,1.102,1.08,1.059,1.048,0.996,0.996,0.986,0.946,0.937,0.909,0.9,0.873,0.829,0.829,0.837,0.796,0.803,0.812,0.779,0.748,0.718,0.747,0.747,0.762,0.769,0.746,0.761,0.723,0.723,0.752,0.737,0.715,0.701,0.708,0.708,0.736,0.721,0.736,0.721,0.692,0.692,0.713,0.691,0.664,0.65,0.657,0.677,0.663,0.663,0.65,0.663,0.656,0.676,0.642,0.636,0.636,0.648,0.648,0.648,0.668,0.654,0.681,0.647,0.64,0.621,0.621,0.646,0.614,0.607,0.577,0.56,0.537,0.521,0.532,0.542,0.548,0.531,0.531,0.51,0.49,0.499,0.479,0.489,0.474,0.451,0.455,0.441,0.424,0.415,0.395,0.379,0.383,0.375,0.382,0.398,0.378,0.393,0.393,0.377,0.389,0.4,0.412,0.392,0.376,0.376,0.387,0.368,0.357,0.368,0.375,0.367,0.371,0.375,0.39,0.401,0.417,0.401,0.409,0.417,0.438,0.425,0.425,0.429,0.429,0.42,0.404,0.412,0.412,0.395,0.387,0.395,0.383,0.387,0.395,0.375,0.371,0.386,0.386,0.398,0.39,0.398,0.405,0.418,0.422,0.439,0.443,0.434,0.439,0.417,0.421,0.404,0.404,0.412,0.404,0.4,0.404,0.412,0.412,0.395,0.376,0.391,0.398,0.39,0.379,0.375,0.364,0.349,0.363,0.352,0.345,0.342,0.345,0.345,0.345,0.345,0.342,0.325,0.334,0.324,0.334,0.324,0.334,0.324,0.311,0.317,0.317,0.327,0.327,0.313,0.313,0.313,0.32,0.333,0.319,0.329,0.325,0.332,0.345,0.338,0.349,0.352,0.345,0.348,0.355,0.348,0.345,0.345,0.341,0.352,0.369,0.362,0.373,0.38,0.391,0.403,0.391,0.407,0.407,0.403,0.423,0.419,0.427,0.444,0.444,0.426,0.426,0.414,0.401,0.385,0.4,0.392,0.396,0.412,0.4,0.384,0.395,0.407,0.419,0.419,0.407,0.399,0.391,0.406,0.386,0.386,0.367,0.385,0.397,0.381,0.362,0.376,0.384,0.365,0.354,0.347,0.347,0.347,0.333,0.329,0.329,0.326,0.326,0.333,0.316,0.307,0.297,0.291,0.291,0.303,0.309,0.309,0.321,0.312,0.321,0.315,0.308,0.321,0.327,0.34,0.347,0.344,0.35,0.365,0.383,0.39,0.375,0.364,0.374,0.363,0.378,0.366,0.359,0.366,0.37,0.388,0.404,0.412,0.408,0.4,0.404,0.388,0.388,0.399,0.387,0.391,0.379,0.387,0.387,0.391,0.399,0.399,0.411,0.419,0.419,0.427,0.431,0.423,0.419,0.398,0.414,0.422,0.413,0.422,0.417,0.43,0.447,0.438,0.421,0.438,0.451,0.451,0.442,0.442,0.446,0.437,0.433,0.415,0.399,0.399,0.411,0.403,0.391,0.41,0.394,0.378,0.393,0.393,0.397,0.381,0.377,0.396,0.384,0.4,0.392,0.407,0.403,0.403,0.403,0.419,0.428,0.411,0.402,0.406,0.406,0.398,0.41,0.406,0.41,0.427,0.414,0.414,0.418,0.418,0.397,0.405,0.417,0.43,0.434,0.417,0.404,0.408,0.404,0.42,0.403,0.391,0.372,0.353,0.371,0.36,0.367,0.363,0.363,0.345,0.359,0.345,0.358,0.362,0.347,0.34,0.337,0.33,0.337,0.347,0.35,0.336,0.343,0.353,0.368,0.36,0.378,0.371,0.378,0.378,0.371,0.385,0.378,0.366,0.352,0.352,0.355,0.348,0.345,0.341,0.345,0.358,0.351,0.362,0.369,0.376,0.365,0.369,0.369,0.387,0.399,0.391,0.406,0.394,0.41,0.426,0.418,0.401,0.409,0.421,0.413,0.425,0.417,0.434,0.438,0.42,0.404,0.408,0.424,0.432,0.445,0.463,0.463,0.454,0.445,0.423,0.435,0.444,0.444,0.448,0.435,0.422,0.439,0.461,0.479,0.474,0.474,0.484,0.503,0.528,0.544,0.566,0.589,0.583,0.6,0.576,0.571,0.593,0.623,0.611,0.604,0.58,0.557,0.568,0.568,0.545,0.54,0.556,0.584,0.596,0.578,0.595,0.571,0.588,0.612,0.624,0.606,0.63,0.617,0.599,0.599,0.611,0.58,0.597,0.603,0.634,0.665,0.639,0.626,0.626,0.657,0.677,0.711,0.704,0.683,0.662,0.636,0.661,0.654,0.648,0.641,0.667,0.66,0.687,0.707,0.729,0.707,0.686,0.658,0.632,0.657,0.683,0.663,0.636,0.611,0.611,0.586,0.61,0.64,0.628,0.634,0.647,0.634,0.608,0.602,0.596,0.578,0.601,0.601,0.619,0.638,0.657,0.684,0.67,0.67,0.656,0.63,0.624,0.624,0.63,0.636,0.656,0.662,0.636,0.648,0.635,0.667,0.634,0.627,0.646,0.653,0.672,0.672,0.672,0.645,0.626,0.651,0.625,0.65,0.65,0.624,0.643,0.623,0.636,0.623,0.605,0.58,0.586,0.557,0.54,0.535,0.519,0.524,0.513,0.503,0.523,0.534,0.523,0.544,0.533,0.522,0.507,0.512,0.537,0.521,0.495,0.48,0.5,0.485,0.475,0.499,0.494,0.513,0.498,0.508,0.493,0.483,0.497,0.512,0.497,0.492,0.502,0.517,0.506,0.512,0.532,0.521,0.521,0.527,0.542,0.515,0.515,0.536,0.514,0.494,0.484,0.469,0.484,0.464,0.464,0.46,0.446,0.428,0.437,0.441,0.445,0.45,0.441,0.432,0.445,0.44,0.449,0.449,0.449,0.44,0.449,0.44,0.462,0.485,0.471,0.475,0.475,0.475,0.461,0.475,0.456,0.451,0.465,0.456,0.437,0.437,0.459,0.464,0.478,0.459,0.44,0.462,0.462,0.472,0.49,0.481,0.476,0.457,0.457,0.475,0.451,0.451,0.469,0.488,0.478,0.488,0.493,0.478,0.459,0.477,0.458,0.449,0.462,0.453,0.44,0.422,0.426,0.443,0.426,0.426,0.447,0.46,0.451,0.429,0.411,0.407,0.407,0.395,0.399,0.399,0.403,0.387,0.406,0.41,0.402,0.414,0.427,0.444,0.452,0.462,0.471,0.49,0.49,0.509,0.499,0.489,0.479,0.489,0.508,0.529,0.534,0.534,0.534,0.513,0.533,0.528,0.528,0.523,0.538,0.554,0.56,0.543,0.565,0.554,0.565,0.582,0.599,0.617,0.598,0.622,0.641,0.615,0.634,0.666,0.672,0.659,0.646,0.652,0.665,0.638,0.645,0.651,0.632,0.651,0.651,0.644,0.638,0.67,0.676,0.676,0.683,0.697,0.704,0.739,0.746,0.754,0.731]};

// Load Mitcoin information from the database
client.query("SELECT * FROM mitcoin", (err, res) => {
  //mitcoinInfo = JSON.parse(res.rows[0].info);
});

function updateDatabase(info, table) {
  if (maintenance) return;
  
  let infoString = JSON.stringify(info);

  client.query(`DELETE FROM ${table}`);

  let substrIncrement = 65535;
  for (let i = 0; i < infoString.length; i += substrIncrement) {
    client.query(`INSERT INTO ${table} VALUES(${i / substrIncrement}, '${infoString.substr(i, substrIncrement)}')`);
  }
};

// Automatically fluctuate Mitcoin's value and update automatic things
setInterval(function() {
  // Calculate the random fluctuation
  // Without demand: mitcoinInfo.value *= (round(random(10) - 5 + (1 - value) / 5) + 100) / 100
  let fluctuation = Math.round(Math.random() * 10 - 4.96 + mitcoinInfo.demand / 16);

  // Demand decays slightly over time
  mitcoinInfo.demand *= 0.9997;
  
  // Change Mitcoin's value
  mitcoinInfo.value *= (fluctuation + 100) / 100;
  mitcoinInfo.history.push(parseFloat(mitcoinInfo.value.toFixed(3)));
  mitcoinInfo.history.splice(0, mitcoinInfo.history.length - maxHistory - 1);
  
  if (!maintenance) {
    bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(3)} | m/help`);

    // Save new value to the database
    updateDatabase(mitcoinInfo, "mitcoin");
  }
  else bot.user.setActivity("Maintenance");

  // Update Mitcoin server roles
  let leaderboard = Object.values(mitcoinInfo.balances).sort((a, b) => b.balance - a.balance);
  let ids = [];
  for (let i = 0; i < Math.min(leaderboard.length, 5); i++) {
    bot.users.forEach(u => {
      if (mitcoinInfo.balances[u.id] && mitcoinInfo.balances[u.id] === leaderboard[i]) ids.push(u.id);
    })
    if (mitcoinInfo.balances[ids[ids.length - 1]] !== leaderboard[i]) {
      leaderboard.splice(i, 1);
      i--;
    }
  }
  
  bot.guilds.get("424284908991676418").members.forEach(m => {
    // Richest of the Rich
    if (m.roles.has("527225117818880000") && mitcoinInfo.balances[m.user.id] !== mitcoinInfo.balances[ids[0]]) m.removeRole("527225117818880000");
    else if (!m.roles.has("527225117818880000") && mitcoinInfo.balances[m.user.id] === mitcoinInfo.balances[ids[0]] && ids[0]) m.addRole("527225117818880000");

    // Leaderboard Member
    if (m.roles.has("527225117818880000") || (m.roles.has("530794529612365863") && !ids.includes(m.user.id))) m.removeRole("530794529612365863");
    else if (!m.roles.has("527225117818880000") && !m.roles.has("530794529612365863") && ids.includes(m.user.id)) m.addRole("530794529612365863");

    // Mitcoin Millionaire
    if (m.roles.has("530794639301673000") && mitcoinInfo.balances[m.user.id] && mitcoinInfo.balances[m.user.id].balance < 1000000) m.removeRole("530794639301673000");
    else if (!m.roles.has("530794639301673000") && mitcoinInfo.balances[m.user.id] && mitcoinInfo.balances[m.user.id].balance >= 1000000) m.addRole("530794639301673000");
  })
}, fluctuationTime);

// When the bot is loaded
bot.on("ready", async () => {
  if (Object.keys(mitcoinInfo.balances).length <= 0 && bot.user.id === "430468476038152194") {
    console.log("Database not loaded properly?");
    bot.users.get(executives[0]).send("Database not loaded properly?").then(setTimeout(function() {process.exit(0);}, 0));
  }

  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);
  if (maintenance) bot.user.setActivity("Maintenance");
  else bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(3)} | m/help`);

  // Log a backup of all Mitcoin info
  console.log(JSON.stringify(mitcoinInfo));
});

// Send an alert when the bot joins a new server
bot.on("guildCreate", guild => {
  let logChannel = bot.channels.get(logs);
  console.log(`NEW SERVER JOINED: ${guild.name}`)

  let joinEmbed = new Discord.RichEmbed()
  .setColor("#23dc23")
  .setThumbnail(guild.iconURL)
  .setTitle("New server joined")
  .setDescription(guild.name)
  .addField("Server owner", `${guild.owner.user.username}#${guild.owner.user.discriminator}\nID: ${guild.ownerID}`)
  .addField("Created at", guild.createdAt)
  .addField("Members", guild.memberCount)
  .addField("Invites", "None")
  .setFooter(`Server ID: ${guild.id}`)
  .setTimestamp(guild.joinedAt);
  logChannel.send(joinEmbed);

  // Attempt to get invites to the server
  guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.member(bot.user)).has("CREATE_INSTANT_INVITE")).first().createInvite({maxAge: 0}).then(i => {
    joinEmbed.fields[3].value = `[${i.code}](https://discord.gg/${i.code} '${i.inviter.username}#${i.inviter.discriminator} | #${i.channel.name}')`;
    logChannel.send(joinEmbed);
  })
});

bot.on("guildDelete", guild => {
  let leaveEmbed = new Discord.RichEmbed()
  .setColor("#dc2323")
  .setThumbnail(guild.iconURL)
  .setTitle(`Server ${guild.memberCount > 0 ? "left" : "deleted"}`)
  .setDescription(guild.name)
  .addField("Server owner", `${guild.owner.user.username}#${guild.owner.user.discriminator}\nID: ${guild.ownerID}`)
  .addField("Created at", guild.createdAt)
  .setFooter(`Server ID: ${guild.id}`)
  if (guild.memberCount > 0) leaveEmbed.addField("Members", guild.memberCount)

  bot.channels.get(logs).send(leaveEmbed);
});

// For the Mitcoin server
bot.on("guildMemberAdd", member => {
  if (member.guild.id === "424284908991676418") {
    // Automatically give the user the Order of Mitcoin role
    member.addRole("518863961618251776");

    // Send some information about the user
    let joinEmbed = new Discord.RichEmbed()
    .setColor("ff9900")
    .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL)
    .setTitle("New member joined")
    .setDescription(`${member}`)
    .addField("Account created", member.user.createdAt)
    .addField("Balance", `${(mitcoinInfo.balances[member.user.id] || {balance: 0}).balance} ${MTC}`, true)
    .addField("Money", `${(mitcoinInfo.balances[member.user.id] || {money: 1}).money} :dollar:`, true)
    .setFooter(`ID: ${member.user.id}`)
    .setTimestamp(member.joinedAt)

    bot.channels.get(logs).send(joinEmbed);
  }
})

bot.on("guildMemberRemove", member => {
  if (member.guild.id === "424284908991676418") {
    let leaveEmbed = new Discord.RichEmbed()
    .setColor("ff9900")
    .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL)
    .setTitle("Member left")
    .setDescription(`${member}`)
    .setFooter(`ID: ${member.user.id}`)
    .addField("Joined at", member.joinedAt)

    bot.channels.get(logs).send(leaveEmbed);
  }
})

// All bot commands
const commands = {
  balance: {
    name: "balance",
    alias: ["bal"],
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
      .setThumbnail("https://cdn.discordapp.com/attachments/495366302542594058/504035403620155423/iur.png")
      .addField("Mitcoin", `${MTCBal.toFixed(3)} ${MTC}`, true)
      .addField("Equivalent value", `${(mitcoinInfo.value * MTCBal).toFixed(3)} :dollar:`, true)
      .addField("Money", `${mitcoinInfo.balances[balUser.id].money.toFixed(3)} :dollar:`, true)
      .addField("Equivalent value", `${(mitcoinInfo.balances[balUser.id].money / mitcoinInfo.value).toFixed(3)} ${MTC}`, true)
      //if (investmentFunds.users[balUser.id]) balEmbed.addField("Investment fund", `${investmentFunds.users[balUser.id].amount} ${MTC}`)
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

      let blacklistUser = bot.users.get(args[0]) || bot.users.find(u => u.username === args.join(" ")) || message.mentions.members.first();
      if (!blacklistUser) return message.channel.send(`${args.join(" ")} is not a valid user`);
      blacklistUser = blacklistUser.user || blacklistUser;

      // If the user is already blacklisted, remove them
      if (mitcoinInfo.blacklist.includes(blacklistUser.id)) {
        message.channel.send(`User: \`${blacklistUser.username}#${blacklistUser.discriminator}\` successfully removed from blacklist`);
        return mitcoinInfo.blacklist.splice(mitcoinInfo.blacklist.indexOf(blacklistUser.id), 1)
      }

      // Otherwise, blacklist them
      message.channel.send(`User: \`${blacklistUser.username}#${blacklistUser.discriminator}\` successfully added to blacklist`);
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
  /*complain: {
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
  },*/
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
      message.channel.send(`${message.author} has given ${payAmount} ${MTC} to ${payUser.username}#${payUser.discriminator}`);

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
    run: async (message, args) => {
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
      await message.delete().catch();
      message.channel.send(giveEmbed).then(msg => {
        msg.react(MTC.split(/:|>/)[2]);

        // After the giveaway has ended
        setTimeout(function() {
          msg.delete();

          // Determine who reacted to the message
          let entries = msg.reactions.get(MTC.split(/<:|>/)[1]);
          
          // If no one reacted
          if (!entries || entries.count <= 1) return message.channel.send("**No one reacted to the giveaway!**\n__Make sure to react before the time runs out.__");
          console.log(entries)
          // Choose a random winner
          let winner = Math.floor(Math.random() * (entries.count - 1));

          // Find which user was the random winner
          let winUser = 0;
          entries.users.forEach(r => {
            if (!r.bot && winner <= 0 && winUser === 0) winUser = r;
            winner--;
          }).then(e => {
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
            
            // Send it in the blockchain
            let embed = new Discord.RichEmbed()
            .setColor("#ff9900")
            .setTitle("Giveaway ended")
            .setAuthor(`${winUser.username}#${winUser.discriminator}`, winUser.displayAvatarURL)
            .addField("Prize", `${winAmount} ${MTC}`)
            .addField("Participants", entries.count - 1)
            .setTimestamp(msg.createdAt);
            
            bot.channels.get(blockchain).send(embed);
          })
        }, ms(time))
      })
    }
  },
  graph: {
    name: "graph",
    alias: ["chart"],
    desc: "Display a graph of recent Mitcoin values",
    run: async (message, args) => {
      // If there isn't any history and thus nothing to display
      if (mitcoinInfo.history.length <= 0) return message.channel.send("There is no value history yet!");

      // How many fluctuations to be shown
      if (args[0] && (!parseInt(args[0]) || args[0] < 1)) return message.channel.send("Specify a valid number of fluctuations");
      let fluctuations = Math.min(Math.floor(args[0]) || maxHistory, maxHistory);
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
                color: "rgba(174, 175, 177, 0.1)"
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
        if (time >= 60000) timeString += `${Math.floor((time % 3600000) / 60000)} ${Math.floor((time % 3600000) / 60000) === 1 ? "minute" : "minutes"}`;

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
    alias: ["buy"],
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
      
      // Demand increases proportionally to user's balance
      mitcoinInfo.demand += investAmount / mitcoinInfo.balances[message.author.id].money;
      
      // Add the invested amount to the user's balance
      mitcoinInfo.balances[message.author.id].balance += investAmount / mitcoinInfo.value;
      mitcoinInfo.balances[message.author.id].money -= investAmount;

      // If the transaction is at least 100 MTC, give it a 5% tax
      if (investAmount / mitcoinInfo.value >= 100) {
        mitcoinInfo.balances[message.author.id].balance -= investAmount / mitcoinInfo.value * 0.05;

        // Distribute the tax evenly among investment fund holders
        /*for (let i in investmentFunds.users) {
          mitcoinInfo.balances[i].balance += investmentFunds.users[i].amount / investmentFunds.total * investAmount / mitcoinInfo.value * 0.05;
        }*/
      }
      
      // Send the message
      if (mitcoinInfo.balances[message.author.id].money > 0) message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value * (investAmount / mitcoinInfo.value >= 100 ? 0.95 : 1)).toFixed(3)} ${MTC} after investing ${investAmount.toFixed(3)} :dollar: and has ${(mitcoinInfo.balances[message.author.id].money).toFixed(3)} :dollar: left to invest`);
      else message.channel.send(`${message.author} has earned ${(investAmount / mitcoinInfo.value * (investAmount / mitcoinInfo.value >= 100 ? 0.95 : 1)).toFixed(3)} ${MTC} after investing ${investAmount.toFixed(3)} :dollar: and cannot invest any more :dollar:`);

      // Send it in the blockchain
      let embed = new Discord.RichEmbed()
      .setColor("#ff9900")
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
      .addField("Invested", `${investAmount} :dollar:`)
      .addField("Equivalent Amount", `${investAmount / mitcoinInfo.value} ${MTC}`)
      if (investAmount / mitcoinInfo.value >= 100) embed.addField("Tax", `${investAmount / mitcoinInfo.value * 0.05} ${MTC}`)
      .setTimestamp(message.createdAt);
      
      bot.channels.get(blockchain).send(embed);
    }
  },
  invite: {
    name: "invite",
    desc: "Join Mitcoin's server or invite the bot",
    run: (message, args) => {
      // How many humans are in the Mitcoin server
      let serverMembers = 0;
      bot.guilds.get("424284908991676418").members.forEach(member => {
        if (!member.user.bot) serverMembers++;
      })

      // Send an embed for Mitcoin Bot's OAuth link and Mitcoin server invite
      let inviteEmbed = new Discord.RichEmbed().setColor("ff9900").addField("Invite Mitcoin Bot", `[OAuth2 link](https://discordapp.com/api/oauth2/authorize?client_id=430468476038152194&permissions=1878392257&scope=bot 'Mitcoin used in ${bot.guilds.size} servers')`).addField("Official Mitcoin Server", `[yhV8bqz](https://discord.gg/yhV8bqz '${serverMembers} members')`);
      message.channel.send(inviteEmbed);
    }
  },
  leaderboard: {
    name: "leaderboard",
    alias: ["top", "board", "lb"],
    desc: "View the current Mitcoin leaderboard",
    run: (message, args) => {
      // How the leaderboard should sort (MTC by default)
      let type = 0;
      if (args[0] && (args[0].toLowerCase() === "money" || args[0].toLowerCase() === "dollars" || args[0].toLowerCase() === ":dollar:")) type = 1;
      if (args[0] && (args[0].toLowerCase() === "total" || args[0].toLowerCase() === "all")) type = 2;

      // Sort all user balances and store them in the leaderboard
      let leaderboard;
      if (type === 0) leaderboard = Object.values(mitcoinInfo.balances).sort((a, b) => b.balance - a.balance);
      if (type === 1) leaderboard = Object.values(mitcoinInfo.balances).sort((a, b) => b.money - a.money);
      if (type === 2) leaderboard = Object.values(mitcoinInfo.balances).sort((a, b) => (b.money + b.balance * mitcoinInfo.value) - (a.money + a.balance * mitcoinInfo.value));
      
      // If there are no existing user balances
      if (leaderboard[0].balance + leaderboard[0].money === 0) return message.channel.send("No one has any Mitcoin!");
  
      // Set the variable for the usernames of all users on the leaderboard
      let usernames = {
          ids: [],
          usernames: [],
          discriminators: []
      };
  
      // Find the usernames of all leaderboard users
      for (let i = 0; i < Math.min(leaderboard.length, 5); i++) {
          bot.users.forEach(user => {
              if (mitcoinInfo.balances[user.id] && ((type === 0 && mitcoinInfo.balances[user.id].balance === leaderboard[i].balance) || (type === 1 && mitcoinInfo.balances[user.id].money === leaderboard[i].money) || (type === 2 && mitcoinInfo.balances[user.id].money + mitcoinInfo.balances[user.id].balance * mitcoinInfo.value === leaderboard[i].money + leaderboard[i].balance * mitcoinInfo.value)) && !usernames.ids.includes(user.id)) {
                  usernames.ids[i] = user.id;
                  usernames.usernames[i] = user.username;
                  usernames.discriminators[i] = user.discriminator;
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
      for (let i = 0; i < leaderboard.length; i++) {
          if ((type === 0 && leaderboard[i].balance === mitcoinInfo.balances[message.author.id].balance) || (type === 1 && leaderboard[i].money === mitcoinInfo.balances[message.author.id].money) || (type === 2 && leaderboard[i].money + leaderboard[i].balance * mitcoinInfo.value === mitcoinInfo.balances[message.author.id].money + mitcoinInfo.balances[message.author.id].balance * mitcoinInfo.value)) {
              userPlace = i + 1;
          }
      }
      
      // Rich embed message to send the leaderboard in
      let lEmbed = new Discord.RichEmbed()
      .setColor("ff9900")
      .setDescription(type === 0 ? "Mitcoin Leaderboard" : type === 1 ? "Money leaderboard" : "Overall leaderboard")
      .setThumbnail(bot.user.displayAvatarURL)
      .addField("First Place", `${usernames.usernames[0]}#${usernames.discriminators[0]} | ${(type === 0 ? leaderboard[0].balance : type === 1 ? leaderboard[0].money : leaderboard[0].money + leaderboard[0].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[1] && leaderboard[1].balance + leaderboard[1].money > 0) lEmbed.addField("Second Place", `${usernames.usernames[1]}#${usernames.discriminators[1]} | ${(type === 0 ? leaderboard[1].balance : type === 1 ? leaderboard[1].money : leaderboard[1].money + leaderboard[1].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[2] && leaderboard[2].balance + leaderboard[2].money > 0) lEmbed.addField("Third Place", `${usernames.usernames[2]}#${usernames.discriminators[2]} | ${(type === 0 ? leaderboard[2].balance : type === 1 ? leaderboard[2].money : leaderboard[2].money + leaderboard[2].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[3] && leaderboard[3].balance + leaderboard[3].money > 0) lEmbed.addField("Fourth Place", `${usernames.usernames[3]}#${usernames.discriminators[3]} | ${(type === 0 ? leaderboard[3].balance : type === 1 ? leaderboard[3].money : leaderboard[3].money + leaderboard[3].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[4] && leaderboard[4].balance + leaderboard[4].money > 0) lEmbed.addField("Fifth Place", `${usernames.usernames[4]}#${usernames.discriminators[4]} | ${(type === 0 ? leaderboard[4].balance : type === 1 ? leaderboard[4].money : leaderboard[4].money + leaderboard[4].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (userPlace > 5 && (((type === 0 || type === 2) && leaderboard[userPlace - 1].balance > 0) || ((type === 1 || type === 2) && leaderboard[userPlace - 1].money > 1))) lEmbed.addField("Your Place", userPlace)
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
      .setImage("https://cdn.discordapp.com/attachments/424284909473890318/519690965104066563/unknown_7.15.17_PM.png");
  
      message.channel.send(logoEmbed);
    }
  },
  /*reset: {
    name: "reset",
    run: (message, args) => {
      // Check if the user is a Mitcoin executive
      if (!executives.includes(message.author.id)) return;
  
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
  },*/
  restore: {
    name: "restore",
    run: (message, args) => {
      if (!args[0] || !executives.includes(message.author.id)) return;
      bot.channels.get("481797287064895489").fetchMessages({after: args[0]}).then(messages => {
        let messagesArray = messages.array().sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        messagesArray.forEach(m => {
          let userID = m.embeds[0].author.iconURL.substring(35, 53);
          if (m.embeds[0].fields[0].name === "Invested") {
            mitcoinInfo.balances[userID].money -= parseFloat(m.embeds[0].fields[0].value.split(" ")[0]);
            mitcoinInfo.balances[userID].balance += parseFloat(m.embeds[0].fields[1].value.split(" ")[0]);
            if (m.embeds[0].fields[2]) mitcoinInfo.balances[userID].balance -= parseFloat(m.embeds[0].fields[2].value.split(" ")[0]);
          }
          else if (m.embeds[0].fields[0].name === "Sold") {
            mitcoinInfo.balances[userID].balance -= parseFloat(m.embeds[0].fields[0].value.split(" ")[0]);
            mitcoinInfo.balances[userID].money += parseFloat(m.embeds[0].fields[1].value.split(" ")[0]);
          }
          else if (m.embeds[0].fields[0].name === "Given") {
            if (!mitcoinInfo.balances[m.embeds[0].fields[2].value.substring(2, 20)]) mitcoinInfo.balances[m.embeds[0].fields[2].value.substring(2, 20)] = {
              balance: 0,
              money: 1
            };
            mitcoinInfo.balances[userID].balance -= parseFloat(m.embeds[0].fields[0].value.split(" ")[0]);
            mitcoinInfo.balances[m.embeds[0].fields[2].value.substring(2, 20)].balance += parseFloat(m.embeds[0].fields[0].value.split(" ")[0]);
          }
          else if (m.embeds[0].title === "Giveaway ended") {
            if (!mitcoinInfo.balances[userID]) mitcoinInfo.balances[userID] = {
              balance: 0,
              money: 1
            };
            mitcoinInfo.balances[userID].balance += parseFloat(m.embeds[0].fields[0].value.split(" ")[0]);
          }
        })
      });
    }
  },
  revive: {
    name: "revive",
    run: async (message, args) => {
      // Check if the user is a Mitcoin executive
      if (!executives.includes(message.author.id)) return;

      message.delete();
      if (!args[0] || !parseInt(args[0])) return message.channel.send("Specify the message ID");
      
      message.channel.fetchMessage(args[0]).then(msg => {
        if (msg.reactions.size <= 0 || msg.content.length > 0 || msg.author.id !== bot.user.id || msg.embeds[0].title !== `New ${MTC} Giveaway!`) return message.channel.send("Message is not a giveaway");
        
        // Determine who reacted to the message
        let entries = msg.reactions.get(MTC.split(/<:|>/)[1]);

        // If no one reacted
        if (!entries || entries.count <= 1) return msg.delete().then(message.channel.send("**No one reacted to the giveaway!**\n__Make sure to react before the time runs out.__"));
        
        // Choose a random winner
        let winner = Math.floor(Math.random() * (entries.count - 1));
        
        // Find which user was the random winner
        let winUser = 0;
        entries.fetchUsers().then(users => {
          users.forEach(r => {
            if (!r.bot && winner <= 0 && winUser === 0) winUser = r;
            winner--;
          })
        }).then(e => {
          // If the winner doesn't have a Mitcoin balance yet, set it up
          if (!mitcoinInfo.balances[winUser.id]) mitcoinInfo.balances[winUser.id] = {
            balance: 0,
            money: 1
          }
          
          let winAmount = parseFloat(msg.embeds[0].fields[0].value);
          
          // Give the winner their Mitcoin
          mitcoinInfo.balances[winUser.id].balance += winAmount;
          
          // Show the giveaway in a new embed
          let winEmbed = new Discord.RichEmbed()
          .setColor("#ff9900")
          .setTitle(`${MTC} Giveaway ended!`)
          .addField("Winner", `<@${winUser.id}>`)
          .addField("Amount won", `${winAmount} ${MTC}`)
          .setTimestamp(msg.createdAt)
          
          msg.delete();
          message.channel.send(winEmbed);
            
          // Send it in the blockchain
          let embed = new Discord.RichEmbed()
          .setColor("#ff9900")
          .setTitle("Giveaway ended")
          .setAuthor(`${winUser.username}#${winUser.discriminator}`, winUser.displayAvatarURL)
          .addField("Prize", `${winAmount} ${MTC}`)
          .addField("Participants", entries.count - 1)
          .setTimestamp(msg.createdAt);
          
          bot.channels.get(blockchain).send(embed);
        })
      }).catch(error => {
        message.channel.send("Specify a valid message ID");
      })
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
      
      let sellAmount = parseFloat(args[0]);
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
      
      // Demand decreases proportionally to user's balance
      mitcoinInfo.demand -= sellAmount / mitcoinInfo.balances[message.author.id].balance;

      // Actually calculate the sale
      mitcoinInfo.balances[message.author.id].balance -= sellAmount;
      mitcoinInfo.balances[message.author.id].money += sellAmount * mitcoinInfo.value;
  
      // Send the confirmation message
      message.channel.send(`${message.author} has sold ${sellAmount.toFixed(3)} ${MTC} and recieved ${(sellAmount * mitcoinInfo.value).toFixed(3)} :dollar:`);

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
      let uptime = (bot.uptime / 100).toFixed(0);

      // Format the time
      if (uptime >= 864000) uptimeMsg += `${Math.floor(uptime / 864000)} day${uptime > 1728000 ? "s" : ""}, `;
      if (uptime >= 36000) uptimeMsg += `${Math.floor((uptime % 864000) / 36000)} hour${uptime % 864000 > 72000 ? "s" : ""}, `;
      if (uptime >= 600) uptimeMsg += `${Math.floor((uptime % 36000) / 600)} minute${(uptime % 36000 > 1200 || uptime % 36000 < 600) ? "s" : ""}, `;
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

/*
let investmentFunds = {
  total: 0,
  users: {}
};
*/

// When a message is sent
bot.on("message", async message => {
  // If the message was sent in the blockchain, that means mitcoinInfo changed and therefore the database needs to be updated
  if (message.channel.id === blockchain && message.author.bot) updateDatabase(mitcoinInfo, "mitcoin");

  // Ignore the message if it is sent by a bot
  if (message.author.bot) return;
  // Ignore the message if it is send in DM
  if (message.channel.type === "dm") return;
  
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
    if (commands[i].name === cmd.slice(prefix.length) || (commands[i].alias && commands[i].alias.includes(cmd.slice(prefix.length)))) {
      // If the user doesn't have a Mitcoin balance yet, set it up
      if (!mitcoinInfo.balances[message.author.id]) mitcoinInfo.balances[message.author.id] = {
        balance: 0,
        money: 1
      }

      if (maintenance && message.channel.id !== "495366302542594058" && message.guild.id !== "430340461878575105") return message.channel.send("Sorry, Mitcoin is currently under maintenance. It will be back up shortly!");
      commands[i].run(message, args);
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
bot.login(botconfig.token || process.env.BOT_TOKEN);
