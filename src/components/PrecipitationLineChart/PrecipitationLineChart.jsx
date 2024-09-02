import React, { useState, useEffect, componentDidMount } from 'react';
import * as d3 from 'd3';
// import './PrecipitationLineChart.css'

export default function PrecipitationLineChart(props) {

    useEffect(() => {
        makeChart();
        window.addEventListener('resize', makeChart);
        return () => window.removeEventListener('resize', makeChart);
    }, []);

    useEffect(() => {
        makeChart();
    }, [props.data, props.dayAhead]);

    const makeChart = async () => {

        try {

            let starth = 0
            let stoph = 24

            if(props.dayAhead) {
                starth = 0 + (props.dayAhead * 24)
                stoph = 24 + (props.dayAhead * 24)
            }

            // clear any previous charts
            d3.select("#precipitation-line-chart").selectAll("svg").remove();

            const probs = props.data.hourly.precipitation_probability.slice(starth, stoph);
            const sums = props.data.hourly.precipitation.slice(starth, stoph);

            let currentWidth = parseInt(d3.select('#precipitation-line-chart').style('width'));
            let currentHeight = currentWidth/2;

            var margin = {top: currentHeight/10, right: currentWidth/7.5, bottom: currentHeight/5, left: currentWidth/10 },
                width = currentWidth - margin.left - margin.right,
                height = currentHeight - margin.top - margin.bottom;

            const svg = d3.select("#precipitation-line-chart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

            // create axes
            var x1 = d3.scaleLinear()
                .domain([0, 24])
                .range([0, width]);

            var x1Axis = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x1).tickSize(0).tickPadding(10).ticks(12));

            x1Axis.selectAll('text')
                .attr("font-size",".7vw");

            // Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + margin.top/2 + 15)
                .text("Hours")
                .attr("font-size",".7vw");

            var x2 = d3.scaleBand()
                .range([ 0, width ])
                .domain(d3.range(24))
                .padding(0.2);

            var y1 = d3.scaleLinear()
                .domain([0, 100])
                .range([ height, 0 ]);

            let y2Max = d3.max(sums);
            if(y2Max == 0) {
                y2Max = 1;
            }
            var y2 = d3.scaleLinear()
                .domain([0, y2Max])
                .range([height, 0]);
            
            var y1Axis = svg.append("g")
                .call(d3.axisLeft(y1).tickSize(0).tickPadding(10).ticks(5));

            y1Axis.selectAll('text')
                .attr("font-size",".7vw");

            var y2Axis = svg.append("g")
                .attr('transform', 'translate(' + width + ',0)')
                .call(d3.axisRight(y2).tickSize(0).tickPadding(10).ticks(5));

            y2Axis.selectAll('text')
                .attr("font-size",".7vw");

            // Y1 axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left/3 - 10)
                .attr("x", -margin.top)
                .text("% Chance of Rain")
                .attr("font-size",".7vw");

            // Y2 axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(90)")
                .attr("y", -width - margin.right/3 - 12)
                .attr("x", 3 * margin.top)
                .text("Rainfall in Inches")
                .attr("font-size",".7vw");

            // add bars
            svg.selectAll("bars")
                .data(sums)
                .enter()
                .append("rect")
                    .attr("x", (d, i) => { return x2(i) })
                    .attr("y", (d) => { return y2(d) })
                    .attr("width", x2.bandwidth())
                    .attr("height", (d) => { return height - y2(d); })
                    .attr("fill", "#D0D4F2");

            // add line plot
            svg.append("path")
                .datum(probs)
                .attr("fill", "none")
                .attr("stroke", "#007559")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x((d, i) => { return x1(i) })
                .y((d) => { return y1(d) }));


            // tooltip
            var focus = svg.append("g")
                .style("display", "none");

            // append the x line
            focus.append("line")
                .attr("class", "x")
                .style("stroke", "gray")
                .style("opacity", 0.3)
                .attr("y1", 0)
                .attr("y2", height);

            // append the y line
            focus.append("line")
                .attr("class", "y")
                .style("stroke", "gray")
                .style("opacity", 0.3)
                .attr("x1", width)
                .attr("x2", width);

            // append the circle at the intersection
            focus.append("circle")
                .attr("class", "y")
                .style("fill", "gray")
                .style("stroke", "none")
                .attr("r", 3);

            // place the value at the intersection
            focus.append("text")
                .attr("class", "y1")
                .style("stroke", "white")
                .style("stroke-width", "3.5px")
                .style("opacity", 0.8)
                .attr("dx", '.5em')
                .attr("dy", "-2em")
                .attr('font-size', '.75em');
            focus.append("text")
                .attr("class", "y2")
                .attr("dx", '.5em')
                .attr("dy", "-2em")
                .attr('font-size', '.75em');

            // place the date at the intersection
            focus.append("text")
                .attr("class", "y3")
                .style("stroke", "white")
                .style("stroke-width", "3.5px")
                .style("opacity", 0.8)
                .attr("dx", '.5em')
                .attr("dy", "-.5em")
                .attr('font-size', '.75em');
            focus.append("text")
                .attr("class", "y4")
                .attr("dx", '.5em')
                .attr("dy", "-.5em")
                .attr('font-size', '.75em');

            svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function() { focus.style("display", null); })
                .on("touchstart", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("touchend", function() { focus.style("display", "none"); })
                .on("touchmove", (event) => {
                    updateTool(event, 'touch')
                })
                .on("mousemove", (event) => {
                    updateTool(event, 'mouse')
                });

            function updateTool(event, type) {

                var d = 0;

                if(type == 'mouse') {
                    var x0 = x1.invert(d3.pointer(event, svg.node())[0]);
                } else if(type == 'touch') {
                    var x0 = x1.invert(d3.pointers(event, svg.node())[0][0]);
                }

                d = Math.floor(x0);
                if(d < 0) {
                    d = 0;
                } else if(d > 23) {
                    d = 23;
                }

                var time;
                if(d == 0) {
                    time = '12 am';
                } else if(d < 12) {
                    time = d + ' am';
                } else if(d == 12) {
                    time = '12 pm';
                } else {
                    time = (d - 12) + ' pm';
                }

                focus.select("circle.y")
                    .attr("transform",  
                        "translate(" + x1(d) + "," +  
                                        y1(probs[d]) + ")"); 

                focus.select("text.y1")
                    .attr("transform",
                            "translate(" + x1(d) + "," +
                                            y1(probs[d]) + ")")
                    .text(probs[d] + '%');
        
                focus.select("text.y2")
                    .attr("transform",
                            "translate(" + x1(d) + "," +
                                            y1(probs[d]) + ")")
                    .text(probs[d] + '%');
        
                focus.select("text.y3")
                    .attr("transform",
                            "translate(" + x1(d) + "," +
                                            y1(probs[d]) + ")")
                    .text(time);
        
                focus.select("text.y4")
                    .attr("transform",
                            "translate(" + x1(d) + "," +
                                            y1(probs[d]) + ")")
                    .text(time);

                focus.select(".x")
                    .attr("transform",
                            "translate(" + x1(d) + "," +
                                            y1(probs[d]) + ")")
                    .attr("y2", height - y1(probs[d]));
        
                focus.select(".y")
                    .attr("transform",
                            "translate(" + width * -1 + "," +
                                            y1(probs[d]) + ")")
                    .attr("x2", width + width);

            }

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    if(props) {
        return (
            <div className='component-wrapper vertical-container'>
                <h3>Precipitation Probabilities</h3>
                <div id='precipitation-line-chart'></div>
            </div>
        )
    } else {
        return (
            <div>
                <h3>Precipitation Probabilities</h3>
                <h3>Loading ...</h3>
            </div>
        )
    }

}