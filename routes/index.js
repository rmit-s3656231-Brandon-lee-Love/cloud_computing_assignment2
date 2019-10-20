const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { RiotApi } = require('../config/keys');
const fetch = require('node-fetch');

router.get('/', (req, res) => res.render('welcome'));

router.get('/dashboard', ensureAuthenticated,  async function (req, res) {
    
    var call_summoner_id = (`https://oc1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.user.summonerName}?api_key=${RiotApi}`);
    var summoner_info_id = "";
    var summoner_info_rank = "";
    var summoner_info_championId = "";
    var summoner_info_mastery = "";
    var summoner_info_match = [];
    // Fetch summoner id data from API
    await fetch(call_summoner_id).then(response => response.json())
    .then(data => {
        summoner_info_id = data;
    })
    const { id, accountId } = summoner_info_id;
    
    // API link for ramk  stats
    var call_summoner_rank_info = (`https://oc1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${RiotApi}`)
    var call_summoner_champion_id = (`https://oc1.api.riotgames.com/lol/match/v4/matchlists/by-account/${accountId}?api_key=${RiotApi}`)
    var call_summoner_champion_name = (`http://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json`)
    var call_summoner_mastery = (`https://oc1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}?api_key=${RiotApi}`)

    //fetch champion ID from API
    await fetch(call_summoner_champion_id).then(response => response.json())
    .then(data => {
            summoner_info_championId = data.matches;
    })

    //champions
    var champions = [];
    await fetch(call_summoner_champion_name).then(response => response.json())
    .then(data => {
        for(var i in data.data){
            champions.push([i,data.data[i]]);
        }
    })
    var last_played = champions.find(x => x[1].key == summoner_info_championId[0].champion);


    //mastery
    await fetch(call_summoner_mastery).then(response => response.json())
    .then(data => {
        summoner_info_mastery = data[0];
    })


    //highest mastery champ and points
    var high_mastery = champions.find(x => x[1].key == summoner_info_mastery.championId);
    var mastery_points = summoner_info_mastery.championPoints;


    //Grabbing match 
    var call_summoner_info_match = (`https://oc1.api.riotgames.com/lol/match/v4/matches/${summoner_info_championId[0].gameId}?api_key=${RiotApi}`)
    await fetch(call_summoner_info_match).then(response => response.json())
    .then(data => {
        summoner_info_match = data;
    })

    var summoner_info_match_teams = summoner_info_match.teams;
    console.log(summoner_info_match_teams[0]);
    var summoner_info_match_participants = summoner_info_match.participants;
    var summoner_info_participants_names = summoner_info_match.participantIdentities;
    console.log(summoner_info_participants_names);

    var participants = [];

    for(var h in summoner_info_participants_names){
        participants.push(summoner_info_participants_names[h].player);
        console.log(summoner_info_participants_names[h].player);
    }

    var redside = [];
    var blueside = [];
    console.log("here");
    console.log(participants);

    for(var z = 0; z < 10; z++){
        if(z <5){
            redside.push(participants[z].summonerName);
            
        } else {
            blueside.push(participants[z].summonerName);
        } 
    }
    
    var my_team = "";
    var outcome = "";
    var side = ""; 
    
    for(var i in summoner_info_match_participants){
        if(summoner_info_match_participants[i].championId == summoner_info_championId[0].champion){
            my_team = summoner_info_match_participants[i].teamId;
            if (my_team == "100"){
                side = "Blue Side";
            } else {
                side = "Red Side";
            }
            for(var j in summoner_info_match_teams){ 
                if (summoner_info_match_teams[j].teamId == my_team){
                    outcome = summoner_info_match_teams[j].win;
                    if(outcome == "Fail"){
                        outcome = "Defeat";
                    } else {
                        outcome = "Victory";
                    }
                    console.log(outcome);
                }
            }
        }
    }
    
    // Fetch Summoner Rank Info by ID from API
    await fetch(call_summoner_rank_info).then(response => response.json())
    .then(data => {
        summoner_info_rank = data[0];
    })
    const { tier, rank, leaguePoints, wins, losses } = summoner_info_rank;
    res.render("dashboard", {
        summonerName: req.user.summonerName,
        tier: tier,
        rank: rank,
        LP: leaguePoints,
        wins: wins,
        losses: losses,
        summoner_info_championId: summoner_info_championId,
        last_played: last_played,
        summoner_info_mastery: summoner_info_mastery,
        high_mastery: high_mastery,
        mastery_points: mastery_points,
        outcome: outcome,
        side: side,
        redside: redside,
        blueside: blueside
    })
});

module.exports = router;