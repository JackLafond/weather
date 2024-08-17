import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
// import './Temp.css';

export default function Temp(props) {

    const [temp, setTemp] = useState([]);
    const [precip, setPrecip] = useState([]);
    const [cover, setCover] = useState([]);
    const [wind, setWind] = useState(null);
    const [uv, setUv] = useState(null);
    const [humid, setHumid] = useState(null);


    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        getData();
    }, [props.data]);

    useEffect(() => {
        remakeChart = () => {
            makeChart(temp, 'temp');
            makeChart(precip, 'precip');
            makeChart(cover, 'cover');
        }
        window.addEventListener('resize', remakeChart);
        return () => window.removeEventListener('resize', remakeChart);
    }, [temp, precip, cover]);

    const getData = async () => {

        try {

            var now = new Date();
            now.setMinutes(0, 0, 0)

            var ix = 0;
            for(let i = 0; i < props.data.hourly.time.length; i++) {
                if(Date.parse(props.data.hourly.time[i]) === now.getTime()) {
                    ix = i;
                    break;
                }
            }

            var minTemp = d3.min(props.data.hourly.temperature_2m.slice(0, 24));
            var maxTemp = d3.max(props.data.hourly.temperature_2m.slice(0, 24));
            var curTemp = props.data.current.temperature_2m;
    
            setTemp([minTemp, curTemp, maxTemp]);
            makeChart([minTemp, curTemp, maxTemp], 'temp');

            var minPrecip = d3.min(props.data.hourly.precipitation_probability.slice(0, 24));
            var maxPrecip = d3.max(props.data.hourly.precipitation_probability.slice(0, 24));
            var curPrecip = props.data.hourly.precipitation_probability[ix];

            setPrecip([minPrecip, curPrecip, maxPrecip]);
            makeChart([minPrecip, curPrecip, maxPrecip], 'precip');

            var minCover = d3.min(props.data.hourly.cloud_cover.slice(0, 24));
            var maxCover = d3.max(props.data.hourly.cloud_cover.slice(0, 24));
            var curCover = props.data.current.cloud_cover;

            setCover([minCover, curCover, maxCover]);
            makeChart([minCover, curCover, maxCover], 'cover');

            setUv(props.data.daily.uv_index_max[0]);
            setWind(props.data.daily.wind_speed_10m_max[0]);
            setHumid(d3.max(props.data.hourly.relative_humidity_2m.slice(0, 24)))

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    function makeChart(rangeData, id) {

        // clear any previous charts
        d3.select("#" + id + "-range-chart").selectAll("svg").remove();

        let currentWidth = parseInt(d3.select('#' + id + '-range-chart').style('width'));
        let currentHeight = currentWidth/4;

        var margin = {top: currentHeight/5, right: currentWidth/5, bottom: currentHeight/5, left: currentWidth/5 },
            width = currentWidth - margin.left - margin.right,
            height = currentHeight - margin.top - margin.bottom;

        const svg = d3.select("#" + id + "-range-chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .domain([rangeData[0], rangeData[2]])
            .range([0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickValues([rangeData[0], rangeData[2]]).tickSize(0).tickPadding(-height).tickFormat((x) => {
                if(id == 'temp') {
                    return `${x} \u00B0F`;
                } else if(id == 'precip' || id == 'cover') {
                    return `${x}%`;
                } else {
                    return `${x}`;
                }
            }));

        var circle = svg.selectAll("circles")
            .data(rangeData)
            .enter()
            .append("circle")
                .style("fill", (d) => { 
                    if(d == rangeData[1]) {
                        return "#007559"
                    } else {
                        return "gray"
                    }
                })
                .attr("r", (d) => { 
                    if(d == rangeData[1]) {
                        return 5
                    } else {
                        return 3
                    }
                })
                .attr("cy", height)
                .attr("cx", (d) => { return x(d)});

    }

    let remakeChart = () => {
        makeChart(temp, 'temp');
        makeChart(precip, 'precip');
        makeChart(cover, 'cover');
    }

    if(props) {
        return (
            <div className='horizontal-container'>
                <div className='vertical-container component-wrapper center-content'>
                    <h3>Current Temp</h3>
                    <p>{temp[1] + ' \u00B0F'}</p>
                    <div id='temp-range-chart'></div>
                </div>
                <div className='vertical-container component-wrapper center-content'>
                    <h3>Current Precip</h3>
                    <p>{precip[1] + '%'}</p>
                    <div id='precip-range-chart'></div>
                </div>
                <div className='vertical-container component-wrapper center-content'>
                    <h3>Current Cover</h3>
                    <p>{cover[1] + '%'}</p>
                    <div id='cover-range-chart'></div>
                </div>
                <div className='vertical-container component-wrapper center-content'>
                    <h3>Max UV</h3>
                    <p>{uv}</p>
                </div>
                <div className='vertical-container component-wrapper center-content'>
                    <h3>Max Humidity</h3>
                    <p>{humid + '%'}</p>
                </div>
                <div className='vertical-container component-wrapper center-content'>
                    <h3>Max Wind Speed</h3>
                    <p>{wind + ' mph'}</p>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <h3>Loading ... </h3>
            </div>
        )
    }

}