const { pool } = require('../config/db');

let liveCache = null;
let scheduledCache = null;
let liveInterval = null;
let isLiveMode = false;

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

// Sauvegarde les matchs terminés en BDD
const saveFinishedMatches = async (matches) => {
    for (const match of matches) {
        if (match.status === 'finished') {
            try {
                await pool.query(`
                INSERT INTO matches (id_api, id_player1, id_player2, id_tournoi, tournament_name, scheduled_at, status, home_wins)
                VALUES ($1, $2, $3, $4, $5, $6, 'finished', $7)
                ON CONFLICT (id_api) DO UPDATE SET status = 'finished', home_wins = $7
                `, [
                match.id,
                match.players?.p1?.id,
                match.players?.p2?.id,
                match.tournament_id,
                match.tournament,
                match.scheduled_time,
                match.winner === 1
                ]);
            } catch (err) {
                console.error('Erreur sauvegarde match :', err.message);
            }
        }
    }
};

// Poll les matchs en direct
const pollLive = async () => {
    try {
        const data = await fetchFromAPI('/matches?status=live');
        liveCache = data;

        if (data.data) await saveFinishedMatches(data.data);

        // Plus aucun match en live → retour en veille
        if (!data.data?.length) {
            console.log('Plus de matchs en direct, retour en veille ');
            clearInterval(liveInterval);
            liveInterval = null;
            isLiveMode = false;
            liveCache = null;
        }
    } catch (err) {
        console.error('Erreur poll live :', err.message);
    }
};

// Démarre le mode live
const startLiveMode = () => {
    if (isLiveMode) return; // déjà en mode live
    console.log('Passage en mode live ✓');
    isLiveMode = true;
    pollLive(); // appel immédiat
    liveInterval = setInterval(pollLive, 480000); // toutes les 8 min (free tier)
};

// Programme le mode live selon les fixtures
const scheduleLiveMode = (fixtures) => {
    const now = new Date();

    // Trouve le prochain match à venir
    const nextMatch = fixtures
        .filter(m => new Date(m.scheduled_time) > now)
        .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))[0];

    if (!nextMatch) {
        console.log('Aucun match à venir aujourd\'hui');
        return;
    }

    const matchTime = new Date(nextMatch.scheduled_time);
    const delay = matchTime - now - (10 * 60 * 1000); // 10 min avant le match

    if (delay <= 0) {
        // Match déjà commencé ou imminent
        startLiveMode();
    } else {
        console.log(`Mode live programmé dans ${Math.round(delay / 60000)} minutes`);
        setTimeout(startLiveMode, delay);
    }
};

// Récupère les fixtures du jour
const pollFixtures = async () => {
    try {
        const data = await fetchFromAPI('/fixtures');
        scheduledCache = data;

        if (data.data?.length) {
            scheduleLiveMode(data.data);
        }

        console.log('Fixtures mises à jour ✓');
    } catch (err) {
        console.error('Erreur poll fixtures :', err.message);
    }
};

// Démarre tout
const startPolling = () => {
    // Appel immédiat au démarrage
    pollFixtures();

    // 6h du matin et 18h
    const scheduleFixtureCall = () => {
        const now = new Date();
        const next6h = new Date();
        next6h.setHours(6, 0, 0, 0);
        const next18h = new Date();
        next18h.setHours(18, 0, 0, 0);

        // Si on est après 18h, on programme pour 6h demain
        if (now.getHours() >= 18) {
            next6h.setDate(next6h.getDate() + 1);
        }

        const nextCall = now.getHours() < 6 ? next6h :
                        now.getHours() < 18 ? next18h : next6h;

        const delay = nextCall - now;
        console.log(`Prochain appel fixtures dans ${Math.round(delay / 60000)} minutes`);

        setTimeout(() => {
        pollFixtures();
        scheduleFixtureCall(); // reprogramme le suivant
        }, delay);
    };

    scheduleFixtureCall();
};

const getLiveCache = () => liveCache;
const getScheduledCache = () => scheduledCache;

module.exports = { startPolling, getLiveCache, getScheduledCache };