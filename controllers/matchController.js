
const { getLiveCache, getScheduledCache, getFinishedATPCache, getFinishedWTACache } = require('../tools/matchHandler.js');


exports.getLive = (req, res) => {
    const data = getLiveCache();
    if (!data || data.length === 0){
        return res.status(404).json({ 
            title: 'no match found',
            status: 404,
            detail: 'no match live'
        });
    }
    res.json(data);
};

exports.getIncoming = async (req, res) =>{
    try {
        const data = getScheduledCache();
        if (!data || data.length === 0){
            return res.status(404).json({ 
                title: 'no match found',
                status: 404,
                detail: 'no match planned'
            });
        }
        return res.json(data);
    } catch (err) {
        return res.status(500).json({message : 'server error during incocming matches display', error: err.message})
    }
}

exports.getFinishedATP = async (req, res) => {
    try {
        const data = getFinishedATPCache()
        if (!data || data.length === 0){
            return res.status(404).json({ 
                title: 'no match found',
                status: 404,
                detail: 'no match finished'
            });
        }
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


exports.getFinishedWTA = async (req, res) => {
    try {
        const data = getFinishedWTACache()
        if (!data || data.length === 0){
            return res.status(404).json({ 
                title: 'no match found',
                status: 404,
                detail: 'no match finished'
            });
        }
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

