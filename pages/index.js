import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import axios from 'axios';
import React, { useRef, useState, useEffect } from 'react';
import { HexColorPicker } from "react-colorful";

const myLoader=({src})=>{
  return `${src}`;
}

const SportsCard = ({ team_1_name, team_2_name, team_1_image_url, team_2_image_url, team_1_score, team_2_score, game_status }) => {
  return (<div className="max-w-md rounded flex flex-row ease-in-out text-white font-normal">
    <div>
        <div className="grid grid-cols-3">
          <div className="flex flex-left">
            <a href={`https://www.google.com/search?q=${team_1_name}`} target="_blank">
              <Image loader={myLoader} src={team_1_image_url} alt={team_1_name} width={100} height={100}/>
            </a>
              <p className="ml-1">{team_1_name} [Home]</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            {game_status != 'Not Started' && <p>{team_1_score} - {team_2_score}</p>}
            <p className="mt-2">{game_status}</p>
          </div>
          <div className="flex text-right">
            <p className="mr-1">{team_2_name} [Away]</p>
            <a href={`https://www.google.com/search?q=${team_2_name}`} target="_blank">
            <Image loader={myLoader} src={team_2_image_url} alt={team_2_name} width={100} height={100}/>
            </a>
          </div>
          <p></p>
        </div>
      </div>
      
    </div>);
  }

  export async function getServerSideProps() {
    const newsRes = await axios.get('https://alln-one.herokuapp.com/api/v1/news');
    const newsTopOne = newsRes.data.data.results[0];
    const newsTopTwo = newsRes.data.data.results[1];
    const newsTopThree = newsRes.data.data.results[2];

    const sportsRes = await axios.get('https://alln-one.herokuapp.com/api/v1/sports');
    const sportsJson = sportsRes.data.data;
    const bkball = sportsJson.basketball
    const bsball = sportsJson.baseball

    const factRes = await axios.get('https://alln-one.herokuapp.com/api/v1/fact');
    const fact = factRes.data.data.text;

    const stocksRes = await axios.get('https://alln-one.herokuapp.com/api/v1/stocks');
    let stockSymbols = stocksRes.data.data

    const elonTweetRes = await axios.get("https://alln-one.herokuapp.com/api/v1/tweets")
    const tweets = elonTweetRes.data.data.data

    const holidayRes = await axios.get(`https://holidays.abstractapi.com/v1/?api_key=e51ea42f08294eb58a179da5a6611a2e&country=US&year=${new Date(Date.now()).getFullYear()}&month=${new Date(Date.now()).getMonth() + 1}&day=${new Date(Date.now()).getDate()}`)
    const holidays = holidayRes.data

    return {
      props: { newsTopOne, newsTopTwo, newsTopThree, bkball, bsball, stockSymbols, fact, tweets, holidays }, // will be passed to the page component as props
    }
  }
  
  export default function Home({ newsTopOne, newsTopTwo, newsTopThree, bkball, bsball, stockSymbols, fact, tweets, holidays }) {
    const inputRef = useRef();
    const [status, setStatus] = useState(null);
    const [temp, setTemp] = useState(null);
    const [wind, setWind] = useState(null);
    const [type, setType] = useState(null);
    const [icon, setIcon] = useState(null);
    const [city, setCity] = useState(null);
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [basketball, setBasketball] = useState(null);
    const [baseball, setBaseball] = useState(null);
    const [gameState, setGameState] = useState({
      mlb: 0,
      nba: 0
    });
    const [menu, setMenu] = useState(false)
    const [pref, setPref] = useState(null);
    const quoteRef = useRef(null);
    
    useEffect(() => {
      setBasketball(bkball)
      setBaseball(bsball)
    }, [bkball, bsball])

    useEffect(() => {
      if (pref) {
        window.localStorage.setItem("allNOnePref", JSON.stringify(pref))
      }
    }, [pref])


    useEffect(() => {
      const preferences = window.localStorage.getItem("allNOnePref")
      if (preferences) setPref(JSON.parse(preferences))
      if (!preferences) setPref({
        time: true,
        quote: true,
        tweet: true,
        holidays: true
      })
      setInterval(async () => {
        const sportsRes = await axios.get('https://alln-one.herokuapp.com/api/v1/sports');
        const sportsJson = sportsRes.data.data;
        const bkkball = sportsJson.basketball
        const bssball = sportsJson.baseball
        setBasketball(bkkball)
        setBaseball(bssball)
      }, 90000)
    }, [])

    useEffect(() => {
      if (pref?.quote && quoteRef.current.innerHTML == "") {
        let i = 0;
        let txt = fact; 
        let speed = 40;
        quoteRef.current.innerHTML = ""
        function typeWriter() {
          if (i < txt.length) {
            quoteRef.current.innerHTML += txt.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
          }
        }
        typeWriter()
      }
    }, [pref])
    
    

    function getTime() {
      let date = new Date();
      let hours = date.getHours();
      let mins = date.getMinutes();
      let seconds = date.getSeconds();
      let session = 'AM';
      
      if(hours == 0) {
        hours = 12;
      }
      
      if(hours > 12){
        hours = hours - 12;
        session = 'PM';
      }
      
      hours = (hours < 10) ? "0" + hours : hours;
      mins = (mins < 10) ? "0" + mins : mins;
      seconds = (seconds < 10) ? "0" + seconds : seconds;
      
      let currentTime = hours + ":" + mins + ":" + seconds + " " + session;
      setTime(currentTime);
    }

    useEffect(() => {
      setInterval(function(){ 
        getTime();
      }, 1000);
    })

    useEffect(() => {
      getTime();
      let d = new Date();
      let dd = d.getDate();
      let mm = d.getMonth()+1; 
      let yyyy = d.getFullYear();
      d = `${mm}/${dd}/${yyyy}`
      setDate(d);
    }, [])

    function handleSubmit(input) {
      input.preventDefault()
      const url = `https://www.google.com/search?q=${inputRef.current.value}`
      window.open(url,  "_blank");
    }

    const myLoader=({src})=>{
      return `${src}`;
    }

    const getWeatherInfo = async () => {
      if (!navigator.geolocation) {
        setStatus('Geolocation is not supported by your browser');
      } else {
        setStatus('Locating...');
        navigator.geolocation.getCurrentPosition(async (position) => {
          setStatus(null);
          const res = await axios.post('https://alln-one.herokuapp.com/api/v1/weather', { latitude: position.coords.latitude, longitude: position.coords.longitude}, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const kTof = (res.data.data.main.temp - 273.15) * 1.8 + 32;
          setTemp(kTof);
          setWind(Math.round(res.data.data.wind.speed/1609));
          setType(res.data.data.weather[0].description);
          setIcon(res.data.data.weather[0].icon);
          setCity(res.data.data.name);
        }, () => {
          setStatus('Unable to retrieve your location');
        });
      }
    }

    return (
      <div className="bg-[#393a40] h-full">
        <Head>
          <meta property="og:title" content="AllnOne" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://localhost:3000" />
          <meta property="og:image" content="https://media.discordapp.net/attachments/771821245292609556/977962835827105843/AllnOne.png?width=702&height=702" />
          <meta property="og:description" content="A homepage for everything you need from a random fact and the weather to stocks and sports games." />
          <link rel = "icon" href="https://media.discordapp.net/attachments/771821245292609556/977962835827105843/AllnOne.png?width=702&height=702" type = "image/x-icon"></link>
          <title>AllnOne</title>
        </Head>
        <div className={styles.container}>
          <div className="z-50 top-1 right-0 lg:top-10 fixed bg-stone-600 py-2 px-1 rounded-l-lg flex justify-center items-center">
            {!menu && <button className="text-3xl hover:animate-spin" onClick={() => setMenu(true)}>⚙️</button>}
            {menu && (
              <div className="monHight:w-[400px] w-[200px] h-[300px] p-2">
                <div className="w-full flex justify-between items-center">
                  <p className="text-white text-2xl font-bold tracking-wide">Settings</p>
                  <button className="text-3xl" onClick={() => setMenu(false)}>⚙️</button>
                </div>
                <div className="flex flex-col">
                  <p className="mt-2 text-xl font-medium text-white">Toggle Elons Tweets</p>
                  <div className="form-check">
                    <input className="pref_checkbox form-check-input h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-rose-500 focus:outline-none transition duration-200 my-1 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer" type="checkbox" onChange={() => setPref({...pref, tweet: !pref.tweet})} id="flexCheckChecked3" checked={pref.tweet} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="mt-2 text-xl font-medium text-white">Toggle Holidays</p>
                  <div className="form-check">
                    <input className="pref_checkbox form-check-input h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-rose-500 focus:outline-none transition duration-200 my-1 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer" type="checkbox" onChange={() => setPref({...pref, holidays: !pref.holidays})} id="flexCheckChecked3" checked={pref.holidays} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="mt-2 text-xl font-medium text-white">Toggle Fact</p>
                  <div className="form-check">
                    <input className="pref_checkbox form-check-input h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-rose-500 focus:outline-none transition duration-200 my-1 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer" type="checkbox" onChange={() => setPref({...pref, quote: !pref.quote})} id="flexCheckChecked3" checked={pref.quote} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="mt-2 text-xl font-medium text-white">Toggle Time</p>
                  <div className="form-check">
                    <input className="pref_checkbox form-check-input h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-rose-500 focus:outline-none transition duration-200 my-1 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer" type="checkbox" onChange={() => setPref({...pref, time: !pref.time})} id="flexCheckChecked3" checked={pref.time} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="weather p-6 max-w-md rounded-lg shadow-md bg-gradient-to-r from-stone-900 to-zinc-800">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">Weather</h5>
            {temp == null ? (
              <div>
                
                <p className="mb-3 font-normal text-gray-400">Click the button below to get your weather data. [location data is not saved]</p>
                <a href="#" className="animate-pulse ease-in-out duration-300 inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-rose-700 rounded-lg hover:bg-rose-800 focus:outline-none  bg-rose-600 hover:bg-rose-700" onClick={async () => await getWeatherInfo()}>
                    Get Weather
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </a>
              </div>
            ):(
              <div className="p-2 max-w-md rounded hover:shadow-lg flex ease-in-out duration-300 bg-[#323236] border-neutral-400 text-white font-normal">
                <div className="filler">
                  <p className="font-normal text-white opacity-100 opacity-[100]">Your current temperature is <strong>{Math.round(temp)}°F</strong></p>
                  <p className="font-normal text-white opacity-100 opacity-[100]">Wind Speed: <strong>{wind}mph</strong></p>
                  <p className="font-normal text-white opacity-100 opacity-[100]">Weather: <strong>{type}</strong></p>
                  <p className="font-normal text-white opacity-100 opacity-[100]">City: <strong>{city}</strong></p>
                </div>
                <div className="justify-end items-center flex w-[160px] bg-[#323236] ">
                  <Image className="bg-neutral-400 bg-opacity-50 backdrop-blur-xl rounded-2xl" src={`http://openweathermap.org/img/wn/${icon}@2x.png`} width={90} height={90}></Image>
                </div>
              </div>
            )}

        </div>
        <div className="news mt-4 p-6 max-w-md rounded-lg shadow-md bg-gradient-to-r from-zinc-800 to-stone-900">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">Trending News</h5>
            <a href={newsTopOne.link} target="_blank">
              <div className="p-2 max-w-md rounded hover:shadow-lg flex flex-row justify-center items-center ease-in-out duration-300 bg-[#323236] border-neutral-400 text-white font-normal mb-3">
                {newsTopOne.image_url && (<div className="rounded-2xl w-[200px] h-[100px] relative overflow-hidden mr-2">
                  <Image loader={myLoader} src={newsTopOne.image_url} layout="fill" objectFit="cover"></Image>
                </div>)}
                <div>
                  <h2 className="text-md font-bold tracking-tight text-white">{newsTopOne.title.substring(0,25)}...</h2>
                  <p>{newsTopOne.description?.substring(0,80) || newsTopOne.content?.substring(0,80)}...</p>
                  <p className="text-sm font-bold">{newsTopOne.creator || 'Anynomous'}・{newsTopOne.category || 'Unknown'}</p>
                </div>
              </div>
            </a>
            <a href={newsTopTwo.link} target="_blank">
              <div className="p-2 max-w-md rounded hover:shadow-lg flex flex-row ease-in-out duration-300 bg-[#323236] border-neutral-400 text-white font-normal mb-3">
                {newsTopTwo.image_url && (<div className="rounded-2xl w-[200px] h-[100px] relative overflow-hidden mr-2">
                  <Image loader={myLoader} src={newsTopTwo.image_url} layout="fill" objectFit="cover"></Image>
                </div>)}
                <div>
                <h2 className="text-md font-bold tracking-tight text-white">{newsTopTwo.title.substring(0,25)}...</h2>
                  <p>{newsTopTwo.description?.substring(0,80) || newsTopTwo.content?.substring(0,80)}...</p>
                  <p className="text-sm font-bold">{newsTopTwo.creator || 'Anynomous'}・{newsTopTwo.category || 'Unknown'}</p>

                </div>
              </div>
            </a>
            <a href={newsTopThree.link} target="_blank">
              <div className="p-2 max-w-md rounded hover:shadow-lg flex flex-row ease-in-out duration-300 bg-[#323236] border-neutral-400 text-white font-normal">
                {newsTopThree.image_url && (<div className="rounded-2xl w-[100px] h-[100px] relative overflow-hidden mr-2">
                  <Image loader={myLoader} src={newsTopThree.image_url} layout="fill" objectFit="cover"></Image>
                </div>)}
                <div>
                <h2 className="text-md font-bold tracking-tight text-white">{newsTopThree.title.substring(0,25)}...</h2>
                  <p>{newsTopThree.description?.substring(0,80) || newsTopThree.content?.substring(0,80)}...</p>
                  <p className="text-sm font-bold">{newsTopThree.creator || 'Anynomous'}・{newsTopThree.category || 'Unknown'}</p>
                </div>
              </div>
            </a>
        </div>
        <div className="flex flex-col items-center justify-center quote mt-4 p-6 max-w-md rounded-lg shadow-md w-[40vw] bg-zinc-700 wave-pattern monitor:min-w-[40vw] m-4">
          <center>
            {pref && pref.time && (
              <>
                <h1 className='text-3xl font-bold tracking-tight monitor:text-5xl text-white'>{time}<div className="filler"><span className='monitor:text-4xl text-2xl font-medium'>{date}</span></div></h1>
                <div className="my-4 h-1 w-full bg-neutral-800 rounded-lg"></div>
              </>
            )}
            {pref && pref.quote && (
              <>
                <h5 id="typewriter" className="typewriter mb-2 text-2xl font-bold tracking-tight text-white" ref={quoteRef}></h5>
                <div className="my-4 h-1 w-full bg-neutral-800 rounded-lg"></div>
              </>
            )}
            {pref && pref.tweet && (
              <>
                <p className="text-2xl font-medium tracking-normal text-white">Elons Most Recent Tweet</p>
                <div className="p-3 rounded-lg bg-stone-800 hover:bg-rose-700 my-4 mx-4 text-white bg-opacity-75 ease-in-out duration-300">
                  <div className="flex items-center">
                    <div className="rounded-2xl w-[40px] h-[40px] relative overflow-hidden mr-2">
                      <Image loader={myLoader} src={'https://pbs.twimg.com/profile_images/1521957986335297536/itVSA7l0_400x400.jpg'} layout="fill" objectFit="cover"></Image>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-left">Elon Musk</p>
                      <p className="text-gray-400 text-left">@elonmusk</p>  
                    </div>
                  </div>
                  <p className="mt-2 text-left text-lg tracking-wide">{tweets[0].text}</p>
                </div>
              </>
            )}
              
            {pref && pref.holidays && (
              <>
                <p className="text-2xl font-medium tracking-normal text-white">Todays Holidays</p>
                <div className="p-3 rounded-lg bg-stone-800 hover:bg-rose-700 my-4 mx-4 text-white bg-opacity-75 ease-in-out duration-300">
                  {holidays && holidays.map(holiday => (
                    <div className="text-left my-2">
                      <p>{holiday.name}</p>
                      <p className="text-gray-400 text-xs">{holiday.location}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </center>
        </div>
        <div className="sports bg-gradient-to-r from-zinc-800 to-stone-900 my-2 rounded-lg shadow-md p-5 ease-in-out duration-300">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">Sports</h5>
          <div className='h-full flex flex-col'>
            <div className="flex flex-col items-center justify-center p-2 mb-3 rounded hover:shadow-lg flex flex-col ease-in-out duration-300 bg-[#323236] border-neutral-400 text-white font-normal h-[41%]">
              <p className="ml-1 text-lg font-medium tracking-tight text-white position-fixed">National Basketball Assosiation</p>
              {basketball && basketball.results >= 1 && (
                <div className="flex items-center justify-center">
                  <div className="">
                    <SportsCard team_1_name={basketball.response[gameState.nba].teams.home.name} team_2_name={basketball.response[gameState.nba].teams.away.name} team_1_image_url={basketball.response[gameState.nba].teams.home.logo} team_2_image_url={basketball.response[gameState.nba].teams.away.logo} team_1_score={basketball.response[gameState.nba].scores.home.total} team_2_score={basketball.response[gameState.nba].scores.away.total} game_status={basketball.response[gameState.nba].status.long}/>
                  </div>
                  <div className="flex flex-col items-center justify-center ml-2">
                    {gameState.nba == 0 ? <button className="text-5xl hover:cursor-not-allowed text-gray-400">⇑</button> : <button className="text-5xl hover:cursor-pointer" onClick={() => setGameState({...gameState, nba: gameState.nba - 1})}>⇑</button>}
                    {gameState.nba == basketball.results - 1 ? <button className="text-5xl hover:cursor-not-allowed text-gray-400">⇓</button> : <button className="text-5xl hover:cursor-pointer animate-bounce" onClick={() => setGameState({...gameState, nba: gameState.nba + 1})}>⇓</button>}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded hover:shadow-lg flex flex-col ease-in-out duration-300 bg-[#323236] border-neutral-400 text-white font-normal h-[41%]">
              <p className="ml-1 text-lg font-medium tracking-tight text-white position-fixed">Major League Baseball</p>
              {baseball && baseball.results >= 1 && (
                <div className="flex items-center justify-center">
                  <div className="">
                    <SportsCard team_1_name={baseball.response[gameState.mlb].teams.home.name} team_2_name={baseball.response[gameState.mlb].teams.away.name} team_1_image_url={baseball.response[gameState.mlb].teams.home.logo} team_2_image_url={baseball.response[gameState.mlb].teams.away.logo} team_1_score={baseball.response[gameState.mlb].scores.home.total} team_2_score={baseball.response[gameState.mlb].scores.away.total} game_status={baseball.response[gameState.mlb].status.long}/>
                  </div>
                  <div className="flex flex-col items-center justify-center ml-2">
                    {gameState.mlb == 0 ? <button className="text-5xl hover:cursor-not-allowed text-gray-400">⇑</button> : <button className="text-5xl hover:cursor-pointer" onClick={() => setGameState({...gameState, mlb: gameState.mlb - 1})}>⇑</button>}
                    {gameState.mlb == baseball.results - 1 ? <button className="text-5xl hover:cursor-not-allowed text-gray-400">⇓</button> : <button className="text-5xl hover:cursor-pointer animate-bounce" onClick={() => setGameState({...gameState, mlb: gameState.mlb + 1})}>⇓</button>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="stocks rounded-lg shadow-md bg-gradient-to-r from-stone-900 to-zinc-800 my-2 p-4">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">Trending Tickers</h5>
          <div className="overflow-y-auto scrollbar-thumb-stone-900 scrollbar-track-zinc-600 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full snap-y h-[17vh]">
            {stockSymbols.map(stock => (
              <div className="m-2 p-2 snap-center flex rounded-md bg-[#323236] justify-between">
                <div className="flex flex-col">
                  <p className="text-white">{stock.ticker}</p>
                  <p className="text-xs text-slate-200">{stock.data.price.shortName}・{stock.data.price.quoteType}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-white text-end">{stock.data.price.currencySymbol}{stock.data.price.regularMarketPrice}</p>
                  <p className={stock.data.price.regularMarketChangePercent < 0 ? "text-red-600 text-xs text-slate-200 text-end" : "text-green-600 text-xs text-slate-200 text-end"}>{stock.data.price.regularMarketChangePercent}%</p>
                </div>
                
              </div>
            ))}
          </div>
        </div>
        <div className="bottom-2 lg:bottom-10 fixed w-full flex justify-center items-center opacity-25 hover:opacity-95 ease-in-out duration-300 ">
          <form onSubmit={handleSubmit} className="hover:opacity-95 ">
            <input className="w-[70vw] text-white h-[40px] p-2 rounded-l-xl bg-gradient-to-l from-stone-900 to-zinc-800 placeholder:text-zinc-400 hover:shadow-md ease-in-out duration-300 " placeholder='Learn More... (powered by Google)' ref={inputRef} autoComplete="off"/>
            <button className="ease-in-out duration-300 inline-flex items-center h-[40px] py-2 px-3 text-sm font-medium text-center text-white bg-rose-700 rounded-r-lg hover:bg-rose-800 focus:outline-none  bg-rose-600 hover:bg-rose-700" onClick={handleSubmit}>
              Search
              <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
          </form>
        </div>
        <div className="absolute -z-10 bg-[#393a40] h-screen w-screen bottom-0 left-0"></div>
      </div>
    </div>
  )
}
