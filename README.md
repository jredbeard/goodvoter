# goodvoter - Hive blockchain vote following bot


## What is it?

This is a vote trail following bot for the Hive blockchain. It allows you to specify multiple accounts to follow the votes of, the weight used to follow that account, and a target amount of voting mana to try to keep your account at. Because of the target voting mana level you are free to continue to manually upvote things and the bot will automatically adjust the voting weight accordingly.

It is written in NodeJS using the hive-js library and runs in a docker container. It only makes a call every 3 seconds to not overwhelm nodes with more calls than necessary. It simply gets the current irreversible head block number, fetches the latest block, parses it for transactions performed by the accounts specified in the config file, looks for vote operations, then adjusts the weight of the vote as necessary based on both the specified percentage and your currently available voting mana and target.

## Why did you write this?

I wrote this years ago for Steem and eventually made the minimal changes to make it work on Hive. I figured some of you might be able to make use of it so open sourcing it is better than letting it rot away. Aspiring newbie Hive app developers may be able to learn from it and use it.

Personally I don't have time to regularly currate content but I do keep some Hive powered up in my account. Rather then let that HP go to waste I'd prefer to follow the votes of accounts that I "trust" to be voting on good content. I wasn't using my HP for a quite a long time but I had some spare time one day and figured I'd dust this off in hopes that my HP goes to good use.

## Does this maximize my curration rewards?

No, this is not designed for "maximum profits" or anything like that as that is not my goal here. My goal is simply to use my available HP in the best way that I can even if I don't have time to do it myself.

## Are there bugs? Is it perfect?

This is not really production quality software and likely has bugs yes - especially the lack of error handling in some cases. I hacked this together for my own purposes and it is not perfect in any way. However, I will say that I've run this for months on end without it crashing or having any apparent issues. I have not taken a close look at the logs nor will I spend the time to do so.

If anyone wants to make a pull request to improve on this I will be happy to take a look when I have time.

## How do I use it?

### Requirements:

Any server or PC that has docker installed and has an internet connection should work fine.

### Setup:

1) Set the accounts to follow, the voting weights, and your target voting mana in the config.js file

2) Build the docker container: `docker build . -t=goodvoter`

3) Run the docker container: `docker run -d --restart always --name goodvoter --env HIVE_USERNAME=<username> --env HIVE_WIF=<posting_wif> goodvoter:latest`
(replace username and posting_wif with your own accounts)

4) Trail the logs: `docker logs -f goodvoter`


