const { pool } = require('../config/db');

let liveCache = null;
let scheduledCache = null;
let finishedCache = null;

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


const poll = async () => {
    try {
    const live = await fetchFromAPI('/matches?status=live&draw=singles');
    const upcoming = await fetchFromAPI('/fixtures?draw=singles');
    const finished = await fetchFromAPI('/history/matches?draw=singles');

    console.log('finished raw:', JSON.stringify(finished).slice(0, 300));
    console.log('finished[0] tour:', finished.data?.[0]?.tour);
    console.log('finished[0] tournament:', finished.data?.[0]?.tournament);

    // On filtre ATP et WTA côté serveur
    liveCache = {
        data: live.data?.filter(m => m.tour === 'atp' || m.tour === 'wta') || []
    };

    scheduledCache = {
        data: upcoming.data?.filter(m => m.tour === 'atp' || m.tour === 'wta') || []
    };

    finishedCache = {
        data: finished.data?.filter(m => m.tour === 'atp' || m.tour === 'wta') || []
    };

    console.log(`Cache mis à jour — ${liveCache.data.length} matchs en direct`);


    } catch (err) {
        console.error('Erreur poll :', err.message);
    }
};


const startPolling = () => {
poll();
    setInterval(poll, 300000); //can be changed ! 
};

const getLiveCache = () => liveCache;
const getScheduledCache = () => scheduledCache;
const getFinishedCache = () => finishedCache;

module.exports = { startPolling, getLiveCache, getScheduledCache, fetchFromAPI, getFinishedCache };