let liveCache = null;
let scheduledCache = null;
let finishedATPCache = null;
let finishedWTACache = null;

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
 
    console.log(`Cache mis à jour — ${liveCache.data.length} matchs en direct`);

    } catch (err) {
        console.error('Erreur poll :', err.message);
    }
};

const poll2 = async () => {
    try {

    const upcoming = await fetchFromAPI('/fixtures?draw=singles&limit=200');

    scheduledCache = {
        data: upcoming.data?.filter(m => (m.tour === 'atp' || m.tour === 'wta') && m.status !== 'finished' && m.status !== 'live' ) || []
    };

    console.log(`scheduled matchs ok`);

    } catch (err) {
        console.error('Erreur poll :', err.message);
    }
};

const startPolling = () => {
    poll();
    setInterval(poll, 261000); // 261 000 secondes = 4.35 minutes. 1440minutes /4.35 = 331, 331*3=993, +4 = 997 (1000 max)
    poll2();
    setInterval(poll2, 21600000); //=6h, donc 4 polls/jour
};

const getLiveCache = () => liveCache;
const getScheduledCache = () => scheduledCache;
const getFinishedATPCache = () => finishedATPCache;
const getFinishedWTACache = () => finishedWTACache;

module.exports = { startPolling, getLiveCache, getScheduledCache, fetchFromAPI, getFinishedATPCache, getFinishedWTACache };