// Simple Steem Trail Following Bot (good_voter)
// This follows blocks and votes on content that another user has voted on at a specified weight
// If your voting power is below your target, it will subtract more weight off of the vote
// (it does this in an attempt to let voting power slowly regenerate)
// Configuration: set voters to follow and vote weight to give in config.js

const steem = require('@steemit/steem-js');
const config = require('./config');

// how long to wait in miliseconds before next run
// (set to 3 seconds)
const blockInterval = 3000;

const username = process.env.STEEM_USERNAME;
const postingWif = process.env.STEEM_WIF;

let lastProcessedBlock = false;

steem.api.setOptions({
  url: "https://api.steemit.com",
  retry: false,
  useAppbaseApi: true,
});

// wrap necessary steem api calls in promises

function getProperties() {
  return new Promise((resolve, reject) => {
    steem.api.getDynamicGlobalProperties(function(err, result) {
      if(!err) {
        resolve(result);
      }
      else {
        console.log(err);
        reject(err);
      }
    });
  });
}

function getBlock(blockNum) {
  return new Promise((resolve, reject) => {
    steem.api.getBlock(blockNum, function(err, result) {
      if(!err) {
        resolve(result);
      }
      else {
        console.log(err);
        reject(err);
      }
    });
  });
}

function broadcastVote(author, permlink, weight) {
  return new Promise((resolve, reject) => {
    steem.broadcast.vote(
      postingWif,
      username, // Voter
      author, // Author
      permlink,
      weight, // Weight (10000 = 100%)
      function(err, result) {
        if(!err) {
          resolve(result);
        }
        else {
          console.log(err);
          reject(err);
        }
      }
    );
  });
}

// takes in intended vote weight
// calculates current voting power
// returns an adjusted weight (to try to keep voting power near target)
async function adjustWeight(originalWeight) {
  return new Promise((resolve, reject) => {
    steem.api.getAccounts([username], function(err, result) {
      if(!err) {
        const secondsago = (new Date - new Date(result[0].last_vote_time + 'Z')) / 1000;
        let vpow = result[0].voting_power + (10000 * secondsago / 432000);
        vpow = Math.min(vpow / 100, 100).toFixed(2);
        console.log(`${username}'s voting power: ${vpow}%`);
        // if voting power is below the target, subtract the difference in percent from weight
        // (probably not 100% accurate)
        // goal is to let voting power recover by not casting regular vote weight
        if(vpow < config.targetMana) {
          let difference = config.targetMana - vpow;
          difference = difference * 100;
          resolve(originalWeight - difference);
        }
        else {
          resolve(originalWeight);
        }
      }
      else {
        console.log(err);
        reject(err);
      }
    });
  });
}

// parse head block from global properties
async function getHeadBlockNumber(properties) {
    return properties.head_block_number;
}

// process all blocks since last update
// returns vote operations from all followed voters in each block
async function processNextBlocks(headBlock) {
  let allTransactions = [];
  let result = [];
  if(!lastProcessedBlock)
    lastProcessedBlock = headBlock;
  // get all transactions in blocks since last update
  for(let i = lastProcessedBlock + 1; i <= headBlock; i++) {
      let block = await getBlock(i);
      allTransactions.push(block.transactions);
      console.log('Processing block: ', i);
  }
  allTransactions.map(transactionsInBlock => {
    transactionsInBlock.map(transaction => {
      transaction.operations.map(operation => {
        // check all voting operations in each transaction
        if(operation[0] == 'vote') {
          if(config.followed.voters.includes(operation[1].voter)) {
            result.push(operation);
          }
        }
      });
    });
  });
  lastProcessedBlock = headBlock;
  return result;
}

// make votes based on list of vote operations
async function makeVotes(voteOperations) {
  voteOperations.map(operation => {
    const voter = operation[1].voter;
    const author = operation[1].author;
    const permlink = operation[1].permlink;
    const weight = operation[1].weight;
    // find intended weight
    // example: if we're following voter at 50% (0.5),
    // the intended weight before voting power adjustment
    // would be 50% of the voters original vote weight
    const intendedWeight = config.voteWeight[operation[1].voter] * weight;
    // do not follow downvotes
    if(weight > 0) {
      console.log(`Voting on ${author}'s content: ${permlink}`);
      console.log(`Based on finding: ${voter}'s vote`);
      console.log(`Voter's vote weight: ${weight / 100}%`);
      console.log(`Intended vote weight: ${intendedWeight / 100}%`);
      adjustWeight(intendedWeight).then(adjustedWeight => {
        console.log(`Adjusted voting weight: ${Math.floor(adjustedWeight) / 100}%`);
        broadcastVote(author, permlink, Math.floor(adjustedWeight));
      });
    }
  });
}

// loops every blockInterval
function eventLoop() {
  getProperties()
  .then(getHeadBlockNumber)
  .then(processNextBlocks)
  .then(makeVotes);
}

function main() {
  console.log('Good voter. Follows votes of specified authors.');
  if(!username || !postingWif) {
    console.log('Error: Please set STEEM_USERNAME and STEEM_WIF environemnt variables.');
    return;
  }
  const mainLoop = setInterval(function () {
    // handle updates here
    eventLoop();
  }, blockInterval);
}

main();
