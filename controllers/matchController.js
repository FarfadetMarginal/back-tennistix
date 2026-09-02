const { pool } = require('../config/db.js') 
const { getLiveCache, getScheduledCache, getFinishedCache } = require('../tools/matchHandler.js');


exports.getLive = (req, res) => {
    const data = getLiveCache();

    if (!data) return res.status(503).json({ message: 'no live matches right now' });

    const tournaments = {};
    data.data.forEach(match => {
        const key = match.tournament_id || match.tournament;
        if (!tournaments[key]) {
            tournaments[key] = {
                name: match.tournament,
                tour: match.tour,
                surface: match.surface,
                matches: []
            };
        }
        tournaments[key].matches.push(match);
    });

    res.json({ tournaments: Object.values(tournaments) });
};

exports.getIncoming = async (req, res) =>{
    try {
        const data = getScheduledCache();
        if (!data || data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });
        res.json(data);
    } catch (err) {
        res.status(500).json({message : 'server error during incocming matches display', error: err.message})
    }
}

exports.getFinished = async (req, res) => {
    try {
        const scheduled = getScheduledCache();
        const activeTournamentNames = [...new Set(
        scheduled?.data?.map(m => m.tournament).filter(Boolean)
        )];

        console.log('Tournois actifs :', activeTournamentNames);
        

        const data = getFinishedCache();
        
        console.log('Premier match finished :', data?.data?.[0])


        const allMatches = data?.data || [];

        // Filtre uniquement les tournois actifs
        const filtered = allMatches.filter(m => 
            activeTournamentNames.includes(m.tournament)
        );

        // Groupe par tournoi
        const tournaments = {};
        filtered.forEach(match => {
            const key = match.tournament;
            if (!tournaments[key]) {
                tournaments[key] = {
                name: match.tournament,
                tour: match.tour,
                surface: match.surface,
                matches: []
                };
            }
            tournaments[key].matches.push(match);
        });

        res.json({ tournaments: Object.values(tournaments) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};