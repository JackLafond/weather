import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import * as d3 from 'd3';
// import './Selects.css';

export default function Selects(props) {

    const [stateopts, setStateopts] = useState([]);
    const [townopts, setTownopts] = useState([]);
    // const [curstate, setCurstate] = useState({label:'Massachusetts', value:'MA'});
    // const [curtown, setCurtown] = useState({label:'Worcester', value:'Worcester 42.2626 -71.8023'});

    useEffect(() => {
        getStateopts();
    }, []);

    useEffect(() => {
        getTownopts();
    }, [props.curstate]);

    const getStateopts = () => {
        let state_options = [];
        d3.csv('weather/src/data/states.csv').then((data) => {
            data.forEach((d) => {
                state_options.push({label: d.State, value: d.Abbreviation});
            });
        });
        setStateopts(state_options);
    }

    const getTownopts = () => {
        let town_options = [];
        d3.csv('weather/src/data/state_towns/' + props.curstate.value + '.csv').then((data) => {
            data.forEach((d) => {
                town_options.push({label: d.name, value: d.name + ' ' + d.latitude + ' ' + d.longitude});
            });
        });
        setTownopts(town_options);
    }

    if(stateopts && stateopts.length > 0) {
        return (
            <div className='horizontal-container component-wrapper'>
                <div className='vertical-container'>
                    <h5>Weather in</h5>
                    <h1 id='current-town'>{props.curtown.label + ', ' + props.curstate.value}</h1>
                </div>

                <div className='horizontal-container'>
                    <label htmlFor='state'>State:
                        <Select name='state' id='state' defaultValue={{label:'Massachusetts', value:'MA'}} onChange={props.setCurstate} options={stateopts}></Select>
                    </label>

                    <label htmlFor='town'>Town/City:
                        <Select name='town' id='town' defaultValue={{label:'Worcester', value:'Worcester 42.2626 -71.8023'}} onChange={props.setCurtown} options={townopts}></Select>
                    </label>
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