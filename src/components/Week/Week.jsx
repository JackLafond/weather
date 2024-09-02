import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import './Week.css';

export default function Week(props) {

    const [days, setDays] = useState([])

    const dayDict = {
        0: 'Sun',
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat'
    }

    useEffect(() => {
        getDays()
    }, [])

    const getDays = () => {
        let d = new Date()
        let start = d.getDay()
        let curDays = []
        let cur = start
        for(let i = 0; i < 7; i++) {
            curDays.push(cur < 7 ? cur : cur - 7)
            cur++
        }
        setDays(curDays)
        props.setMyDay(start)
    }

    const updateDays = (x) => {
        props.setMyDay(x)
        let d = new Date()
        let cur = d.getDay()
        props.setDayAhead(x >= cur ? x - cur : x - cur + 7)
    }

    if(days && days.length > 0) {
        return (
            <div className='horizontal-container component-wrapper'>
                {days.map(x => {
                    return <a key={x} onClick={() => updateDays(x)} className={props.myDay == x ? 'active' : ''}>{dayDict[x]}</a>
                })}
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