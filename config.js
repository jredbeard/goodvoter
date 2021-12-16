let config = {};

// voters to follow
config.followed = {
    voters: ['gtg', 'ocdb', 'curangel'],
}

// vote weight in percent (total should equal 1)
config.voteWeight = {
    'gtg': 0.33,
    'ocdb': 0.33,
    'curangel': 0.33,
}

// target voting mana in percent
config.targetMana = 75;

module.exports = config;