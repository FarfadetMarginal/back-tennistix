const { findFinishedMatchs, player1Win, player2Win } = require('../models/matchModels');
const { updateResultProno } = require('../models/pronoModels');
const { updateScoreUser } = require('../models/userModels');

let liveCache = null;
let scheduledCache = null;
let finishedATPCache = null;
let finishedWTACache = null;
let playersCache = null;

const API_KEY = process.env.APIKEY;
const BASE_URL = 'https://api.livetennisapi.com/api/public/v1';

const fetchFromAPI = async (endpoint) => {
const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
    }
});
    return await response.json();
};

const pronoUpdater = async () =>{
    const result = await findFinishedMatchs()

    const allFinished = [
        ...(finishedATPCache?.data || []),
        ...(finishedWTACache?.data || [])
    ];
    
    for(const item of result) {
        const finishedMatch = allFinished.find(m => m.id == item.id_api);

        if (!finishedMatch) continue;

        if(finishedMatch){
            
            if(finishedMatch.winner == 1){
                await player1Win(finishedMatch.id)
            }
            
            if(finishedMatch.winner == 2){
                await player2Win(finishedMatch.id)
            }
            
            await updateResultProno(finishedMatch.winner, finishedMatch.id)

            await updateScoreUser(finishedMatch.id, finishedMatch.winner)
        }   
    };
}

const poll = async () => {
    try {
    const live = await fetchFromAPI('/matches?status=live&draw=singles');
    const finishedatp = await fetchFromAPI('/history/matches?draw=singles&tour=atp');
    const finishedwta = await fetchFromAPI('/history/matches?draw=singles&tour=wta');

    // On filtre ATP et WTA côté serveur
    liveCache = {
        data: live.data?.filter(m => m.tour === 'atp' || m.tour === 'wta') || []
    };

    finishedATPCache = {
        data: finishedatp.data
    }

    finishedWTACache = {
        data: finishedwta.data
    }

    await pronoUpdater();
 
    console.log(`Cache updated — ${liveCache.data.length} matchs live`);

    } catch (err) {
        console.error('Error during poll :', err.message);
    }
};

const pollplayer = async () =>{
    try {
        const players = await fetchFromAPI('/players?limit=200');
        playersCache = {
            data : players.data || []
        }
    } catch (err) {
        console.error('Error during poll player :', err.message);
    }
}


const poll2 = async () => {
    try {

    const upcoming = await fetchFromAPI('/fixtures?draw=singles&limit=200');

    scheduledCache = {
        data: upcoming.data?.filter(m => (m.tour === 'atp' || m.tour === 'wta') && m.status !== 'finished' && m.status !== 'live' ) || []
    };

    } catch (err) {
        console.error('Error during poll :', err.message);
    }
};

const startPolling = () => {
    poll();
    setInterval(poll, 261000); // 261 000 ms = 4.35 minutes. 1440minutes /4.35 = 331, 331*3=993, +4 +1 = 998 (1000 max)
    poll2();
    setInterval(poll2, 21600000); //=6h, donc 4 polls/jour
    pollplayer();
    setInterval(pollplayer, 86400000); //=24h, donc 1 polls/jour
};

const getLiveCache = () => liveCache;
const getScheduledCache = () => scheduledCache;
const getFinishedATPCache = () => finishedATPCache;
const getFinishedWTACache = () => finishedWTACache;
const getPlayersCache = () => playersCache;

module.exports = { startPolling, getLiveCache, getScheduledCache, fetchFromAPI, getFinishedATPCache, getFinishedWTACache, getPlayersCache };