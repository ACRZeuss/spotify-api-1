const express = require('express');
const router = express.Router();

const { getCurrentSong, getProfile } = require('../spotify-api/userIslem');


router.get('/getCurrentSong', async (req, res) => {

    const { access_token } = req.query;

    const calanSarki = await getCurrentSong(access_token);

    res.json(calanSarki);

});

router.get('/getProfile', async (req, res) => {

    const { access_token } = req.query;

    const calanSarki = await getProfile(access_token);

    res.json(calanSarki);

});

module.exports = router;