import { useState, useEffect, createRef } from 'react'
import * as d3 from 'd3';
import './App.css'
import Selects from './components/Selects/Selects'
import Temp from './components/Temp/Temp'
import TempLineChart from './components/TempLineChart/TempLineChart'
import PrecipitationLineChart from './components/PrecipitationLineChart/PrecipitationLineChart'

function App() {
  const [curstate, setCurstate] = useState({label:'Massachusetts', value:'MA'});
  const [curtown, setCurtown] = useState({label:'Worcester', value:'Worcester 42.2626 -71.8023'});
  const [data, setData] = useState(null);
  const [temps, setTemps] = useState([]);
  const [hours, setHours] = useState([]);

  useEffect(() => {
    getWeather();
  }, []);

  useEffect(() => {
    console.log("town changed");
    console.log(curtown);
    getWeather();
  }, [curtown])

  const getWeather = async () => {

    try {

      let url = 'https://api.open-meteo.com/v1/forecast?latitude=42.2626&longitude=-71.8023&current=temperature_2m,precipitation,cloud_cover&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,cloud_cover&daily=sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';

      if(curtown) {
        let vals = curtown.value.split(' ');
        url = 'https://api.open-meteo.com/v1/forecast?latitude=' + vals[1] + '&longitude=' + vals[2] + '&current=temperature_2m,precipitation,cloud_cover&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,cloud_cover&daily=sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      setData(result);

      setTemps([...result.hourly.temperature_2m]);
      setHours([...result.hourly.time]);

    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  if(data) {
    return (
      <div id='app'>
        <Selects curstate={curstate} curtown={curtown} setCurstate={setCurstate} setCurtown={setCurtown}></Selects>
        <Temp data={data}></Temp>
        <TempLineChart data={data}></TempLineChart>
        <PrecipitationLineChart data={data}></PrecipitationLineChart>
      </div>
    )
  } else {
    return (
      <div id='app'>
        <h1>Loading...</h1>
      </div>
    )
  }
}

export default App
