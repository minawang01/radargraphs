const { Stats } = require('fs');
const MonkeyLearn = require('monkeylearn')
const fetch = require('node-fetch');
require("dotenv").config();

async function getSentiment(data) {
    const ml = new MonkeyLearn(process.env.ML_KEY)
    let model_id = 'cl_pi3C7JiL';
    let res = await ml.classifiers.classify(model_id, data);
    console.log(res.raw_responses[0].status);
    return {
        "stats": res.raw_responses[0].status,
        "tag": res.body[0].classifications[0].tag_name,
        "confidence": res.body[0].classifications[0].confidence
    }
}

let lyricsAPIKey = process.env.MSX_KEY;
let root = "https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=";
async function getLyrics(title, artist) {
    let url = root + title + "&q_artist=" + artist + "&apikey=" + lyricsAPIKey;
    let result = await fetch(url, {
        mode: 'no-cors',
    })
    let data = await result.json();
    let status_code = data.message.header.status_code;
    if(status_code != 200) {
        return {
            status: status_code,
            data: "Failed to retrieve"
        }
    }
    let lyrics = data.message.body.lyrics.lyrics_body;
    if(lyrics == '') {
        return {
            status: 0,
            data: "Lyrics unavailable"};
    }
    let parse = lyrics.split("...", 2)[0];
    return {
        status: status_code,
        data: parse
    };
}

async function getSenti(title, artist) {
    let {status, data} = await getLyrics(title, artist);
    let d = [data];
    if(status == 200) {
        let {stats, tag, confidence} = await getSentiment(d);
        if(stats == 200) {
            return {
                status: stats,
                res: {tag, confidence}
            }
        } 
    }
    return {
        status: status,
        res: {
            tag: "none",
            confidence: "none"
        }
    }
}

module.exports = {getSenti, getLyrics, getSentiment};