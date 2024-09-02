import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
// import './TempLineChart.css';

export default function TempLineChart(props) {

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
            d3.select("#temp-line-chart").selectAll("svg").remove();

            const temps = props.data.hourly.temperature_2m.slice(starth, stoph);

            let currentWidth = parseInt(d3.select('#precipitation-line-chart').style('width'));
            let currentHeight = currentWidth/2;

            var margin = {top: currentHeight/10, right: currentWidth/7.5, bottom: currentHeight/5, left: currentWidth/10 },
                width = currentWidth - margin.left - margin.right,
                height = currentHeight - margin.top - margin.bottom;

            const svg = d3.select("#temp-line-chart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

            // create axes
            var x = d3.scaleLinear()
                .domain([0, 24])
                .range([0, width]);

            var xAxis = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSize(0).tickPadding(10).ticks(12));

            xAxis.selectAll('text')
                .attr("font-size",".7vw");

            // Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + margin.top/2 + 15)
                .text("Hours")
                .attr("font-size",".7vw");

            var y = d3.scaleLinear()
                .domain([d3.min(temps) - 5, d3.max(temps) + 5])
                .range([ height, 0 ]);
            
            var yAxis = svg.append("g")
                .call(d3.axisLeft(y).tickSize(0).tickPadding(10).ticks(5));

            yAxis.selectAll('text')
                .attr("font-size",".7vw");

            // Y axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left/3 - 10)
                .attr("x", -margin.top)
                .text("Temp \u00B0F")
                .attr("font-size",".7vw");

            // add line plot
            svg.append("path")
                .datum(temps)
                .attr("fill", "none")
                .attr("stroke", "#007559")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x((d, i) => { return x(i) })
                .y((d) => { return y(d) }));


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
                    var x0 = x.invert(d3.pointer(event, svg.node())[0]);
                } else if(type == 'touch') {
                    var x0 = x.invert(d3.pointers(event, svg.node())[0][0]);
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
                        "translate(" + x(d) + "," +  
                                        y(temps[d]) + ")"); 

                focus.select("text.y1")
                    .attr("transform",
                            "translate(" + x(d) + "," +
                                            y(temps[d]) + ")")
                    .text(temps[d] + ' \u00B0F');
        
                focus.select("text.y2")
                    .attr("transform",
                            "translate(" + x(d) + "," +
                                            y(temps[d]) + ")")
                    .text(temps[d] + ' \u00B0F');
        
                focus.select("text.y3")
                    .attr("transform",
                            "translate(" + x(d) + "," +
                                            y(temps[d]) + ")")
                    .text(time);
        
                focus.select("text.y4")
                    .attr("transform",
                            "translate(" + x(d) + "," +
                                            y(temps[d]) + ")")
                    .text(time);

                focus.select(".x")
                    .attr("transform",
                            "translate(" + x(d) + "," +
                                            y(temps[d]) + ")")
                    .attr("y2", height - y(temps[d]));
        
                focus.select(".y")
                    .attr("transform",
                            "translate(" + width * -1 + "," +
                                            y(temps[d]) + ")")
                    .attr("x2", width + width);

            }

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    if(props) {
        return (
            <div className='component-wrapper vertical-container'>
                <h3>Temp Over Time</h3>
                <div id='temp-line-chart'></div>
            </div>
        )
    } else {
        return (
            <div>
                <h3>Temp Over Time</h3>
                <h3>Loading ...</h3>
            </div>
        )
    }

}