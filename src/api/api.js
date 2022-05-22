const express = require("express");
const axios = require("axios");
const { setCache, getCache } = require("../middlewares");
const yahooFinance = require('yahoo-finance');
const moment = require('moment')

const router = express.Router();
// /api/v1/:route

router.post("/weather", async (req, res) => {
  const lat = req.body.latitude;
  const long = req.body.longitude;
  const apiLink = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${process.env.weather_api_key}`;
  const response = await axios.get(apiLink);
  return res.send({
    data: response.data,
  });
});

router.get("/fact", async (req, res) => {
  const fact = getCache("fact");
  if (fact == undefined) {
    const apiLink = "https://uselessfacts.jsph.pl/random.json?language=en";
    const response = await axios.get(apiLink);
    setCache("fact", { data: response.data });
    return res.send({
      data: response.data,
    });
  }
  return res.send({
    data: fact.data,
  });
});

router.get("/news", async (req, res) => {
  const news = getCache("news");
  if (news == undefined) {
    const apiLink =
      "https://newsdata.io/api/1/news?apikey=" + process.env.news_api_key + "&country=us&language=en";
    const response = await axios.get(apiLink);
    setCache("news", { data: response.data });
    return res.send({
      data: response.data,
    });
  }
  return res.send({
    data: news.data,
  });
});

router.get("/stocks", async (req, res) => {
  const stocks = getCache("stocks");
  if (stocks == undefined) {
    const apiLink = "https://yfapi.net/v1/finance/trending/US";
    const response = await axios.get(apiLink, {
      params: { textFormat: "Raw", safeSearch: "Off" },
      headers: {
        "X-API-KEY": process.env.stocks_api_key,
        accept: "application/json",
      },
    });
    let stockSymbols = response.data.finance.result[0].quotes;
    for (let i = 0; i < stockSymbols.length; i++) {
      try {
        const quotes = await yahooFinance.quote(stockSymbols[i].symbol);
        stockSymbols[i] = {
          ticker: stockSymbols[i].symbol,
          data: quotes
        }
      } catch (e) {
        stockSymbols.splice(i, i + 1); 
      }
    }
    setCache("stocks", { data: stockSymbols });
    return res.send({
      data: stockSymbols,
    });
  }
  return res.send({
    data: stocks.data,
  });
});


router.get("/sports", async (req, res) => {
  const sports = getCache("sports");
  if (sports == undefined) {
    const basketballApiLink = "https://v1.basketball.api-sports.io/games";
    const season = `${new Date(Date.now()).getFullYear() - 1}-${new Date(Date.now()).getFullYear()}`
    const base_date = new Date(moment(new Date(Date.now())).tz('America/New_York'))
    const date = `${base_date.getFullYear()}-0${base_date.getMonth() + 1}-${base_date.getDate()}`
    const basketballResponse = await axios.get(basketballApiLink, {
      params: { date: date, timezone: 'America/New_York', league: 12, season: season },
      headers: {
        "x-apisports-key": process.env.sports_api_key,
      },
    });
    const baseballApiLink = "https://v1.baseball.api-sports.io/games";
    const baseballResponse = await axios.get(baseballApiLink, {
      params: { date: date, timezone: 'America/New_York', league: 1, season: new Date(Date.now()).getFullYear() },
      headers: {
        "x-apisports-key": process.env.sports_api_key,
      },
    });
    setCache("sports", { data: {
      basketball: basketballResponse.data,
      baseball: baseballResponse.data
    } });
    return res.send({
      data: {
        basketball: basketballResponse.data,
        baseball: baseballResponse.data
      },
    });
  }
  return res.send({
    data: sports.data,
  });
});

router.get("/tweets", async (req, res) => {
  const tweets = getCache("tweets");
  if (tweets == undefined) {
    const headers = {'Authorization': 'Bearer ' + process.env.twitter_api_key}
    const elonTweetRes = await axios.get("https://api.twitter.com/2/users/44196397/tweets?exclude=replies%2Cretweets&max_results=5", {
      headers: headers
    })
    setCache("tweets", { data: elonTweetRes.data });
    return res.send({
      data: elonTweetRes.data,
    });
  }
  return res.send({
    data: tweets.data,
  });
});

module.exports = router;
