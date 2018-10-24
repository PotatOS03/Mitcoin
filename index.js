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
 * Add DM commands
 * Add events for the Mitcoin server
 */

// Bot setup
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const bot = new Discord.Client({disableEveryone: true});

// Connect to the database
const { Client } = require("pg");

const client = new Client({
  connectionString: `${botconfig.connectionURL || process.env.DATABASE_URL}`,
  ssl: true
})
client.connect()

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
client.query("SELECT * FROM balances", (err, res) => {
  res.rows.forEach(b => {
    mitcoinInfo.balances[b.id] = {
      balance: b.mitcoin,
      money: b.money
    }
  })
})
mitcoinInfo = {"value":0.73682,"balances":{"210202479164522496":{"balance":0,"money":1},"428285467549630487":{"balance":0,"money":1},"212011192820957184":{"balance":3.1715,"money":0.00251988},"358375189458976771":{"balance":0,"money":1},"413761181275389953":{"balance":0,"money":1},"276167021815791617":{"balance":0,"money":1},"484039049473032207":{"balance":0,"money":1},"325069847736221708":{"balance":0,"money":1},"389904302757642250":{"balance":0,"money":1},"452201135210496011":{"balance":0,"money":1},"485555706804830208":{"balance":0,"money":2.33628},"394168115921158145":{"balance":0,"money":1},"429373737549299724":{"balance":0,"money":1},"486945264821600277":{"balance":0,"money":1},"384039257058050048":{"balance":0,"money":1},"487433092693360640":{"balance":0,"money":1},"427970563395420162":{"balance":0,"money":1},"163437468522250240":{"balance":0,"money":1},"491322224460955661":{"balance":0,"money":1},"213840551059914753":{"balance":0,"money":1},"211220824265326594":{"balance":0,"money":1},"481876944233693184":{"balance":0,"money":1},"492102413797556244":{"balance":0,"money":1},"449348071957069856":{"balance":0,"money":2.31025},"492483225328025600":{"balance":0,"money":1},"246083561986326530":{"balance":0,"money":1},"492492367904112650":{"balance":0,"money":1},"492845971722600449":{"balance":0,"money":1},"486222324165771266":{"balance":0,"money":1},"249101777289347072":{"balance":0,"money":1},"493938577978163210":{"balance":0,"money":1},"328641116884959235":{"balance":1.0101,"money":0},"245227251925385217":{"balance":0,"money":1},"343534823228571659":{"balance":1,"money":0},"474703610538885122":{"balance":0,"money":1.00124},"320654624556056586":{"balance":0.819103,"money":0.001999},"286870380516212747":{"balance":0,"money":1},"118540898236628993":{"balance":0,"money":1},"366447970272542731":{"balance":0,"money":1},"429389648360636419":{"balance":0,"money":1},"153639013545279488":{"balance":0,"money":1},"286664522083729409":{"balance":60.0256,"money":0},"428325571861413889":{"balance":1.05219,"money":0},"218397146049806337":{"balance":0,"money":1},"325070981158928393":{"balance":5.40232,"money":0},"284799940843274240":{"balance":0,"money":1},"460812404666662913":{"balance":0,"money":1},"230450518915416067":{"balance":1.53408,"money":0},"150463430430687233":{"balance":0.002,"money":1},"345282003328958464":{"balance":1.18274,"money":3.51479},"270997352939126794":{"balance":0,"money":1},"295995265037631500":{"balance":84.1486,"money":0},"365444992132448258":{"balance":3.53459,"money":29.9996},"408092142557462538":{"balance":1.01379,"money":0},"439076109678805004":{"balance":0,"money":1},"198942810571931649":{"balance":1.80688,"money":0},"188350841600606209":{"balance":1.12415,"money":0},"221285118608801802":{"balance":0,"money":1},"134800705230733312":{"balance":0,"money":1},"358316213870395392":{"balance":6.45978,"money":17.987},"402882532171055112":{"balance":1.03057,"money":0},"393472861001613312":{"balance":0,"money":1},"316719380811612162":{"balance":0,"money":3.93422},"453645055916244992":{"balance":0,"money":1},"429686318528856074":{"balance":0,"money":1.23611},"322803239563296768":{"balance":0,"money":1},"407674114384461835":{"balance":0,"money":3.11521},"344629561641926658":{"balance":0,"money":1},"467442833498832896":{"balance":0,"money":1},"420372167969210378":{"balance":0,"money":1},"477533272650547224":{"balance":0,"money":1},"385488500440694784":{"balance":0,"money":1},"428984163576578089":{"balance":0,"money":1},"158776870148636683":{"balance":0,"money":1},"402518087653392447":{"balance":0,"money":1.25986},"424163977384165376":{"balance":0,"money":1},"411139755057610752":{"balance":0,"money":1},"244115531160879107":{"balance":0,"money":1},"309845156696424458":{"balance":12.3215,"money":0},"461522449029136385":{"balance":0,"money":1},"306614889194192897":{"balance":0,"money":1},"163973930187489280":{"balance":0,"money":1},"226816693236793344":{"balance":0,"money":1},"416802709484732417":{"balance":0,"money":1},"237598245596037120":{"balance":0,"money":1},"199198825091563520":{"balance":0,"money":1},"265597906701123584":{"balance":0,"money":1},"459101716470824981":{"balance":0,"money":1},"380696802627682305":{"balance":0,"money":1},"202900676202725376":{"balance":0,"money":1},"419151003766620180":{"balance":0,"money":1},"481806289740103700":{"balance":0,"money":1},"227857442103492609":{"balance":0,"money":1},"235565253952405504":{"balance":0,"money":1},"481842036639531008":{"balance":0.905843,"money":1.02946},"482163808404635668":{"balance":0,"money":1},"423559524536811521":{"balance":0,"money":1},"249004302511767562":{"balance":0,"money":1},"479347118847295519":{"balance":0,"money":1},"432712295953596436":{"balance":0,"money":1},"442151814029115402":{"balance":0,"money":1},"370381633305575426":{"balance":0,"money":1},"451805572212195338":{"balance":0,"money":1},"499012550487441408":{"balance":1.0634,"money":0},"210924855481204736":{"balance":0,"money":1},"474591598114504724":{"balance":1.21496,"money":0},"372766403280896000":{"balance":0,"money":1},"489449506639970305":{"balance":0,"money":1},"402568219434680320":{"balance":0,"money":1},"356804576353189888":{"balance":0,"money":1},"375738267682734081":{"balance":0,"money":1},"492851355086487572":{"balance":0,"money":1},"502616347822522393":{"balance":0,"money":1},"244590122811523082":{"balance":0,"money":1},"329410578680512524":{"balance":0,"money":1},"498518135528357890":{"balance":0,"money":1},"462042318388592651":{"balance":0,"money":1},"423405398511321088":{"balance":0,"money":1},"382561088534872065":{"balance":0,"money":1}},"blacklist":[],"history":[0.669,0.502,0.522,0.548,0.576,0.553,0.575,0.592,0.562,0.551,0.568,0.551,0.567,0.584,0.596,0.584,0.602,0.608,0.589,0.566,0.56,0.555,0.582,0.606,0.587,0.582,0.576,0.599,0.599,0.611,0.635,0.648,0.635,0.629,0.654,0.641,0.653,0.634,0.64,0.653,0.64,0.653,0.685,0.699,0.706,0.692,0.713,0.684,0.664,0.697,0.704,0.697,0.711,0.718,0.703,0.675,0.682,0.668,0.702,0.73,0.759,0.751,0.774,0.79,0.829,0.804,0.788,0.827,0.836,0.836,0.869,0.895,0.877,0.833,0.867,0.849,0.875,0.875,0.831,0.839,0.831,0.823,0.847,0.847,0.881,0.917,0.926,0.954,0.925,0.897,0.852,0.869,0.887,0.887,0.896,0.869,0.834,0.817,0.85,0.876,0.858,0.884,0.919,0.882,0.882,0.856,0.822,0.805,0.765,0.788,0.756,0.794,0.834,0.834,0.859,0.868,0.824,0.816,0.791,0.807,0.823,0.807,0.823,0.84,0.806,0.774,0.797,0.781,0.765,0.75,0.743,0.75,0.75,0.735,0.764,0.78,0.819,0.794,0.786,0.802,0.826,0.826,0.834,0.868,0.833,0.841,0.875,0.884,0.91,0.874,0.909,0.872,0.872,0.881,0.872,0.863,0.907,0.952,0.952,0.971,1.01,0.969,0.979,0.94,0.978,0.968,1.007,0.986,0.967,0.957,0.928,0.947,0.9,0.855,0.88,0.898,0.916,0.879,0.897,0.879,0.914,0.877,0.869,0.851,0.843,0.876,0.911,0.939,0.929,0.929,0.939,0.967,0.928,0.699,0.734,0.705,0.726,0.755,0.77,0.808,0.816,0.816,0.784,0.752,0.782,0.806,0.774,0.805,0.813,0.845,0.854,0.896,0.896,0.887,0.87,0.861,0.861,0.826,0.632,0.651,0.658,0.638,0.638,0.638,0.81,0.786,0.746,0.746,0.731,0.746,0.754,0.738,0.716,0.731,0.738,0.723,0.73,0.767,0.798,0.774,0.789,0.813,0.78,0.749,0.779,0.802,0.827,0.827,0.843,0.826,0.818,0.826,0.793,0.833,0.816,0.783,0.752,0.73,0.737,0.752,0.729,0.722,0.707,0.736,0.75,0.758,0.75,0.728,0.757,0.764,0.772,0.78,0.741,0.778,0.778,0.77,0.747,0.777,0.816,0.856,0.874,0.874,0.908,0.89,0.881,0.846,0.821,0.788,0.772,0.772,0.757,0.719,0.748,0.755,0.755,0.793,0.793,0.761,0.723,0.716,0.723,0.694,0.666,0.68,0.686,0.666,0.659,0.666,0.659,0.646,0.665,0.657,0.657,0.637,0.644,0.683,0.71,0.682,0.661,0.674,0.701,0.687,0.667,0.673,0.694,0.659,0.633,0.645,0.652,0.678,0.685,0.712,0.683,0.683,0.704,0.704,0.683,0.69,0.683,0.669,0.649,0.681,0.702,0.723,0.73,0.759,0.775,0.775,0.767,0.79,0.798,0.806,0.814,0.781,0.75,0.758,0.773,0.78,0.773,0.749,0.772,0.764,0.734,0.763,0.771,0.732,0.703,0.696,0.682,0.655,0.648,0.629,0.641,0.648,0.654,0.654,0.674,0.68,0.714,0.7,0.714,0.714,0.721,0.714,0.685,0.665,0.645,0.619,0.607,0.625,0.631,0.631,0.631,0.606,0.594,0.6,0.594,0.6,0.624,0.611,0.617,0.605,0.629,0.636,0.655,0.668,0.681,0.715,0.694,0.666,0.693,0.699,0.72,0.699,0.685,0.657,0.657,0.644,0.644,0.664,0.664,0.65,0.631,0.631,0.612,0.594,0.6,0.605,0.63,0.649,0.662,0.668,0.668,0.695,0.695,0.674,0.654,0.628,0.659,0.659,0.659,0.652,0.666,0.659,0.626,0.651,0.671,0.691,0.698,0.725,0.718,0.747,0.725,0.739,0.754,0.724,0.695,0.716,0.708,0.701,0.708,0.694,0.694,0.673,0.66,0.66,0.627,0.652,0.632,0.651,0.625,0.632,0.65,0.624,0.643,0.637,0.637,0.662,0.656,0.669,0.662,0.689,0.716,0.752,0.737,0.937,0.919,0.946,0.984,0.974,0.994,0.954,0.916,0.87,0.87,0.887,0.923,0.914,0.941,0.941,0.904,0.858,0.85,0.884,0.848,0.891,0.864,0.83,0.813,0.845,0.812,0.82,0.795,0.771,0.748,0.726,0.733,0.696,0.717,0.753,0.715,0.723,0.723,0.723,0.744,0.714,0.693,0.714,0.692,0.679,0.699,0.692,0.699,0.706,0.735,0.698,0.691,0.677,0.684,0.657,0.643,0.669,0.656,0.63,0.611,0.623,0.642,0.661,0.667,0.687,1.271,1.284,1.258,1.283,1.348,1.294,1.358,1.304,1.317,1.317,1.383,1.314,1.314,1.301,1.236,1.236,1.236,1.186,1.246,1.308,1.308,1.295,1.269,1.269,1.307,1.372,1.386,1.428,1.356,1.329,1.289,1.289,1.238,1.25,1.263,1.212,1.2,1.224,1.248,1.261,1.311,1.298,1.272,1.336,1.282,1.218,1.23,1.181,1.205,1.181,1.24,1.178,1.19,1.154,1.154,1.119,1.164,1.117,1.129,1.14,1.106,1.05,1.029,1.04,1.019,1.06,1.039,1.049,1.007,1.027,1.017,1.007,1.007,1.007,0.976,1.025,1.066,1.034,1.086,1.075,1.086,1.064,1.107,1.14,1.163,1.186,1.162,1.186,1.209,1.161,1.138,1.115,1.159,1.183,1.23,1.242,1.255,1.217,1.217,1.241,1.279,1.317,1.33,1.37,1.302,1.263,1.263,1.3,1.326,1.366,1.421,1.407,1.463,1.478,1.404,1.362,1.362,1.307,1.268,1.204,1.192,1.169,1.215,1.203,1.191,1.251,1.276,1.314,1.38,1.421,1.407,1.463,1.39,1.376,1.376,1.335,1.295,1.23,1.242,1.28,1.254,1.304,1.278,1.316,1.369,1.396,1.327,1.313,1.3,1.3,1.248,1.223,1.187,1.21,1.198,1.138,1.104,1.137,1.103,1.158,1.1,1.067,1.057,1.014,1.025,1.004,0.954,0.983,0.983,0.992,0.982,0.953,0.915,0.906,0.933,0.905,0.932,0.913,0.922,0.941,0.894,0.903,0.912,0.894,0.903,0.93,0.911,0.884,0.857,0.849,0.866,0.857,0.831,0.798,0.822,0.855,0.872,0.889,0.898,0.889,0.889,0.889,0.907,0.925,0.925,0.953,0.953,0.934,0.971,0.942,0.914,0.896,0.94,0.969,0.939,0.968,0.968,0.948,0.977,0.987,0.957,0.967,0.947,0.928,0.928,0.919,0.956,0.994,0.984,0.945,0.907,0.898,0.943,0.933,0.971,0.98,1.019,0.999,0.979,0.96,1.008,0.967,0.996,1.036,1.005,1.005,1.005,1.015,0.995,0.995,1.015,0.984,1.024,1.065,1.054,1.107,1.084,1.041,1.051,1.083,1.094,1.138,1.183,1.124,1.124,1.169,1.227,1.252,1.289,1.225,1.262,1.312,1.338,1.285,1.349,1.403,1.473,1.517,1.578,1.562,1.578,1.546,1.546,1.624,1.608,1.559,1.575,1.654,1.654,1.571,1.508,1.433,1.404,1.432,1.432,1.389,1.389,1.334,1.374,1.332,1.319,1.359,1.331,1.345,1.385,1.427,1.412,1.469,1.44,1.454,1.381,1.423,1.423,1.451,1.422,1.351,1.365,1.31,1.284,1.258,1.271,1.245,1.208,1.256,1.269,1.218,1.169,1.181,1.193,1.252,1.227,1.252,1.252,1.227,1.178,1.131,1.153,1.165,1.223,1.223,1.248,1.235,1.186,1.245,1.232,1.282,1.295,1.308,1.308,1.242,1.267,1.267,1.267,1.292,1.357,1.384,1.37,1.357,1.289,1.302,1.341,1.368,1.326,1.366,1.38,1.38,1.325,1.351,1.365,1.365,1.392,1.364,1.378,1.309,1.27,1.257,1.282,1.244,1.231,1.244,1.194,1.158,1.204,1.192,1.204,1.252,1.202,1.154,1.143,1.2,1.236,1.211,1.259,1.285,1.31,1.323,1.257,1.282,1.308,1.36,1.374,1.429,1.5,1.575,1.497,1.497,1.527,1.481,1.525,1.54,1.602,1.57,1.539,1.539,1.6,1.664,1.681,1.748,1.766,1.748,1.818,1.872,1.797,1.869,1.869,1.907,1.964,1.925,1.944,1.847,1.902,1.864,1.957,1.899,1.956,1.897,1.954,2.032,2.113,2.029,1.968,2.066,2.025,1.924,1.866,1.922,1.999,2.079,2.1,2.141,2.163,2.206,2.294,2.18,2.201,2.113,2.177,2.133,2.155,2.176,2.241,2.264,2.332,2.378,2.402,2.378,2.283,2.374,2.303,2.372,2.396,2.444,2.419,2.419,2.444,2.541,2.44,2.513,2.538,2.589,2.563,2.46,2.51,2.485,2.41,2.386,2.41,2.337,2.267,2.313,2.266,2.266,2.244,2.244,2.221,2.31,2.218,2.284,2.376,2.447,2.398,2.374,2.279,2.347,2.277,2.209,2.187,2.274,2.342,2.389,2.437,2.51,2.585,2.611,2.481,2.357,2.309,2.356,2.379,2.332,2.402,2.45,2.474,2.375,2.328,2.304,2.281,2.259,2.326,2.326,2.35,2.279,2.37,2.299,2.207,2.251,2.229,2.117,2.202,2.224,2.291,2.176,2.22,2.153,2.218,2.24,2.352,2.352,2.352,2.375,2.47,2.495,2.445,2.396,2.42,2.372,2.491,2.391,2.391,2.415,2.415,2.439,2.39,2.271,2.248,2.248,2.293,2.293,2.362,2.291,2.291,2.268,2.155,2.198,2.132,2.046,2.026,2.026,2.087,2.149,2.042,2.083,2.166,2.188,2.21,2.099,2.057,2.037,1.996,2.036,1.954,1.896,1.953,1.972,1.952,1.991,1.991,1.952,2.01,2.091,2.049,2.069,1.986,2.006,1.926,1.888,1.906,1.983,1.943,1.962,1.982,1.883,1.958,1.919,1.9,1.938,1.841,1.786,1.714,1.731,1.818,1.873,1.835,1.909,1.87,1.833,1.778,1.831,1.905,1.809,1.864,1.938,1.899,1.918,1.842,1.86,1.767,1.749,1.697,1.663,1.596,1.565,1.518,1.533,1.456,1.514,1.545,1.545,1.606,1.639,1.622,1.557,1.588,1.541,1.464,1.537,1.537,1.506,1.551,1.489,1.519,1.519,1.534,1.565,1.502,1.563,1.531,1.47,1.529,1.605,1.669,1.619,1.555,1.617,1.568,1.631,1.598,1.646,1.63,1.565,1.502,1.562,1.625,1.56,1.575,1.654,1.621,1.686,1.736,1.667,1.734,1.682,1.631,1.631,1.713,1.764,1.835,1.89,1.965,2.064,2.105,2.042,2.042,2.082,2.082,1.999,2.039,1.998,1.898,1.898,1.917,1.917,1.994,1.914,1.857,1.95,2.028,2.048,2.007,1.907,1.811,1.775,1.704,1.619,1.587,1.65,1.733,1.785,1.731,1.714,1.765,1.8,1.782,1.836,1.818,1.872,1.891,1.985,2.045,2.004,2.024,2.004,2.044,2.085,2.126,2.169,2.104,2.083,1.979,2.058,2.078,2.016,2.056,2.077,1.994,1.994,1.914,1.952,1.894,1.932,1.893,1.836,1.818,1.763,1.693,1.693,1.625,1.56,1.607,1.559,1.574,1.543,1.497,1.467,1.452,1.495,1.466,1.451,1.465,1.48,1.524,1.524,1.509,1.494,1.524,1.585,1.537,1.491,1.521,1.476,1.505,1.55,1.473,1.428,1.457,1.442,1.428,1.428,1.4,1.4,1.441,1.456,1.456,1.383,1.342,1.342,1.355,1.396,1.34,1.393,1.421,1.407,1.393,1.435,1.377,1.419,1.405,1.433,1.461,1.432,1.504,1.549,1.58,1.564,1.58,1.548,1.502,1.457,1.398,1.44,1.44,1.426,1.497,1.497,1.542,1.542,1.511,1.557,1.525,1.495,1.57,1.491,1.476,1.506,1.491,1.565,1.55,1.596,1.532,1.456,1.485,1.455,1.47,1.528,1.559,1.59,1.574,1.59,1.59,1.558,1.605,1.605,1.637,1.686,1.619,1.683,1.667,1.717,1.768,1.715,1.698,1.732,1.801,1.873,1.948,1.948,1.987,2.067,2.149,2.171,2.127,2.127,2.106,2.001,1.981,2.06,1.998,2.038,2.079,2.1,2.079,2.079,2.141,2.098,2.056,2.036,1.995,1.915,1.896,1.877,1.821,1.73,1.764,1.782,1.728,1.728,1.78,1.727,1.779,1.868,1.83,1.885,1.923,1.827,1.863,1.863,1.919,1.862,1.862,1.843,1.898,1.898,1.879,1.861,1.767,1.767,1.732,1.732,1.663,1.746,1.763,1.781,1.692,1.743,1.708,1.793,1.704,1.721,1.669,1.602,1.538,1.507,1.568,1.536,1.475,1.504,1.504,1.489,1.43,1.387,1.373,1.346,1.305,1.318,1.345,1.385,1.33,1.263,1.25,1.2,1.26,1.286,1.286,1.273,1.324,1.324,1.297,1.284,1.297,1.31,1.31,1.284,1.245,1.208,1.184,1.16,1.149,1.137,1.171,0.76,0.798,0.766,0.789,0.773,0.742,0.765,0.749,0.764,0.78,0.803,0.827,0.794,0.81,0.81,0.826,0.826,0.859,0.859,0.851,0.876,0.85,0.858,0.893,0.928,0.938,0.9,0.855,0.898,0.88,0.845,0.862,0.818,0.794,0.81,0.769,0.762,0.784,0.808,0.784,0.815,0.799,0.775,0.783,0.806,0.814,0.798,0.838,0.854,0.854,0.854,0.846,0.888,0.853,0.836,0.836,0.794,0.762,0.77,0.793,0.825,0.808,0.816,0.857,0.84,0.865,0.848,0.814,0.806,0.814,0.838,0.813,0.821,0.829,0.854,0.871,0.915,0.906,0.879,0.861,0.844,0.827,0.786,0.817,0.801,0.809,0.792,0.8,0.8,0.792,0.784,0.8,0.832,0.865,0.865,0.883,0.865,0.9,0.873,0.881,0.908,0.89,0.854,0.888,0.933,0.905,0.896,0.896,0.896,0.86,0.877,0.912,0.876,0.884,0.849,0.891,0.909,0.918,0.946,0.927,0.973,0.934,0.934,0.953,0.934,0.981,1.01,1.061,1.039,0.998,1.028,0.987,1.026,1.067,1.046,1.015,0.994,0.954,0.983,0.993,0.983,0.993,1.013,0.972,0.972,0.992,0.982,0.992,0.962,0.943,0.933,0.924,0.97,0.931,0.913,0.94,0.959,0.997,1.007,1.027,0.996,1.016,0.976,0.966,0.985,1.005,1.005,1.015,1.005,0.975,0.994,0.974,0.945,0.983,1.002,0.992,0.973,0.982,1.022,1.032,1.022,1.011,0.971,0.981,0.981,0.951,0.913,0.886,0.895,0.877,0.868,0.825,0.816,0.792,0.784,0.768,0.799,0.767,0.736,0.714,0.7,0.679,0.699,0.727,0.756,0.749,0.764,0.756,0.733,0.719,0.755,0.732,0.725,0.732,0.732,0.747,0.769,0.777,0.784,0.792,0.816,0.832,0.807,0.84,0.865,0.865,0.9,0.882,0.873,0.873,0.908,0.899,0.943,0.915,0.879,0.835,0.843,0.843,0.868,0.886,0.868,0.903,0.876,0.919,0.919,0.901,0.919,0.901,0.91,0.864,0.821,0.796,0.78,0.749,0.742,0.742,0.742,0.719,0.741,0.741,0.719,0.748,0.718,0.732,0.71,0.731,0.695,0.688,0.681,0.708,0.694,0.722,0.7,0.679,0.674,0.667,0.66,0.693,0.666,0.672,0.686,0.651,0.664,0.684,0.657,0.664,0.697,0.669,0.669,0.662,0.649,0.636,0.668,0.641,0.622,0.628,0.653,0.673,0.686,0.666,0.679,0.652,0.626,0.638,0.625,0.6,0.6,0.582,0.582,0.594,0.582,0.6,0.582,0.576,0.564,0.581,0.552,0.53,0.541,0.519,0.529,0.54,0.54,0.513,0.503,0.518,0.523,0.528,0.518]}

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

// Maximum number of history values to be saved
let maxHistory = 2000;

// Automatically fluctuate Mitcoin's value
setInterval(function() {
  // Calculate the random fluctuation
  let fluctuation = Math.round(Math.random() * 10 - 5 + (1 - mitcoinInfo.value) / 5);
  
  // Change Mitcoin's value
  mitcoinInfo.value *= (fluctuation + 100) / 100;
  mitcoinInfo.history.push(parseFloat(mitcoinInfo.value.toFixed(3)));
  mitcoinInfo.history.splice(0, mitcoinInfo.history.length - maxHistory - 1);
  
  bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(3)} | m/help`);

  // Save new value to the database
  client.query("DELETE FROM history");
  client.query(`UPDATE value SET value = ${mitcoinInfo.value}`);
  for (let i in mitcoinInfo.history) {
    client.query(`INSERT INTO history VALUES(${i}, ${mitcoinInfo.history[i]})`);
  }
}, fluctuationTime);

// When the bot is loaded
bot.on("ready", async () => {
  if (Object.keys(mitcoinInfo.balances).length <= 0) {
    console.log("Database not loaded properly?");
    process.exit();
  }

  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);
  bot.user.setActivity(`MTC Value: ${mitcoinInfo.value.toFixed(3)} | m/help`);
  bot.user.setStatus("online");

  // Log a backup of all Mitcoin info
  console.log(JSON.stringify(mitcoinInfo));
});

// Bot uptime
let uptime = 0;
setInterval(e => uptime++, 100);

// Send an alert when the bot joins a new server
bot.on("guildCreate", async guild => {
  let logChannel = bot.channels.get(logs);

  let joinEmbed = new Discord.RichEmbed()
  .setThumbnail(guild.iconURL)
  .setTitle("New server joined")
  .setDescription(guild.name)
  .addField("Server owner", `${guild.owner.user.username}#${guild.owner.user.discriminator}\nID: ${guild.ownerID}`)
  .addField("Created at", guild.createdAt)
  .addField("Members", guild.memberCount)
  .addField("Invites", "None")
  .setFooter(`Server ID: ${guild.id}`)
  .setTimestamp(guild.joinedAt)

  // Attempt to get invites to the server
  try {
    await guild.fetchInvites().then(invites => invites.forEach(i => {
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
    alias: ["top", "board"],
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
      for (var i = 0; i < Math.min(leaderboard.length, 5); i++) {
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
      for (var i = 0; i < leaderboard.length; i++) {
          if ((type === 0 && leaderboard[i].balance === mitcoinInfo.balances[message.author.id].balance) || (type === 1 && leaderboard[i].money === mitcoinInfo.balances[message.author.id].money) || (type === 2 && leaderboard[i].money + leaderboard[i].balance * mitcoinInfo.value === mitcoinInfo.balances[message.author.id].money + mitcoinInfo.balances[message.author.id].balance * mitcoinInfo.value)) {
              userPlace = i + 1;
          }
      }
      
      // Rich embed message to send the leaderboard in
      let lEmbed = new Discord.RichEmbed()
      .setColor("ff9900")
      .setDescription("Mitcoin Leaderboard")
      .setThumbnail(bot.user.displayAvatarURL)
      .addField("First Place", `${usernames.usernames[0]}#${usernames.discriminators[0]} | ${(type === 0 ? leaderboard[0].balance : type === 1 ? leaderboard[0].money : leaderboard[0].money + leaderboard[0].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[1] && leaderboard[1].balance + leaderboard[1].money > 0) lEmbed.addField("Second Place", `${usernames.usernames[1]}#${usernames.discriminators[1]} | ${(type === 0 ? leaderboard[1].balance : type === 1 ? leaderboard[1].money : leaderboard[1].money + leaderboard[1].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[2] && leaderboard[2].balance + leaderboard[2].money > 0) lEmbed.addField("Third Place", `${usernames.usernames[2]}#${usernames.discriminators[2]} | ${(type === 0 ? leaderboard[2].balance : type === 1 ? leaderboard[2].money : leaderboard[2].money + leaderboard[2].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[3] && leaderboard[3].balance + leaderboard[3].money > 0) lEmbed.addField("Fourth Place", `${usernames.usernames[3]}#${usernames.discriminators[3]} | ${(type === 0 ? leaderboard[3].balance : type === 1 ? leaderboard[3].money : leaderboard[3].money + leaderboard[3].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
      if (leaderboard[4] && leaderboard[4].balance + leaderboard[4].money > 0) lEmbed.addField("Fifth Place", `${usernames.usernames[4]}#${usernames.discriminators[4]} | ${(type === 0 ? leaderboard[0].balance : type === 1 ? leaderboard[4].money : leaderboard[4].money + leaderboard[4].balance * mitcoinInfo.value).toFixed(2)} ${type === 0 ? MTC : ":dollar:"}`)
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
  
  // Old mitcoinInfo to compare later
  let oldInfo = Object.keys(mitcoinInfo);

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
    if (commands[i].name === cmd.slice(prefix.length) || (commands[i].alias && commands[i].alias.includes(cmd.slice(prefix.length)))) commands[i].run(message, args);

    // If mitcoinInfo changed
    if (Object.keys(mitcoinInfo) !== oldInfo) {
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
