import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import coursesData from './result.json'
import TextField from '@mui/material/TextField'
import {Box, Button, Card, FormControlLabel, List, ListItem, ListItemButton, ListItemText, Stack, Switch, Typography, CardActions, CardContent, Paper} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import Container from '@mui/material/Container'
import {useState} from 'react';

function SearchTimeTable() {
  const [searchWord, setSearchWord] = useState('');
  const [filterTimeSlot, setFilterTimeSlot] = useState(new Array(0));
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <SearchWordInput 
            searchWord={searchWord}
            setSearchWord={setSearchWord}
          />
          <div>Serach {searchWord}</div>
          <div>FilterTimeSlot {filterTimeSlot}</div>
          <SearchResult 
            searchWord={searchWord}
            filterTimeSlot={filterTimeSlot}
          />
        </Grid>
        <Grid item xs={9}>
          <TimeSlotFilter 
            setFilterTimeSlot={setFilterTimeSlot}
          >
          </TimeSlotFilter>
        </Grid>
      </Grid>
    </Box>
  )
}

function SearchWordInput( {searchWord, setSearchWord} ) {
  return (
    <Box>
      <TextField 
        placeholder='課程名稱或授課老師' 
        value={searchWord}
        onChange={event => setSearchWord(event.target.value)}
      />
    </Box>
  )
}

function findCourse(searchWord, filterTimeSlot) {
  function decodeCosTime(cosTime) {
    let cosTimeList = cosTime.split(',');
    const date = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
    const timeInterval = {
      'y': '6.00-6.50',
      'z': '7.00-7.50',
      '1': '8.00-8.50',
      '2': '9.00-9.50',
      '3': '10.10-11.00',
      '4': '11.10-12.00',
      'n': '12.20-13.10',
      '5': '13.20-14.10',
      '6': '14.20-15.10',
      '7': '15.30-16.20',
      '8': '16.30-17.20',
      '9': '17.30-18.20',
      'a': '18.30-19.20',
      'b': '19.30-20.20',
      'c': '20.30-21.20',
      'd': '21.30-22.20'
    }

    const regex = new RegExp(`[${date.join('|')}][${Object.keys(timeInterval).join('|')}]+`, 'gi')
    let courseTimeSlot = []
    cosTimeList.forEach((cosTime) => {
      const cosTimeInfo = cosTime.split('-')[0].match(regex);
      if (cosTimeInfo) {
        console.log(cosTimeInfo);
        cosTimeInfo.reduce((acc, cur) => {
          let timeSlotCnt = cur.length-1;
          const date = cur[0];
          for (let i = 0; i < timeSlotCnt; i++) {
              acc.push(date+cur[i+1]);
          }
          return acc
        }, courseTimeSlot);
      }
    })

    console.log(`courseTimeSlot: ${courseTimeSlot}`);
    return courseTimeSlot;

  }
    searchWord = searchWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (searchWord === '' && filterTimeSlot.size === 0) {
      return null;
    }
    const regex = RegExp(`${searchWord}`, "gi");
    let courseIds = new Set();
    let coursesMatch = coursesData.filter(course => {
      return (course.cos_cname.match(regex)) || //&& this.state.filterCourse) ||
      (course.teacher.match(regex)) || //&& this.state.filterTeacher) ||
      (course.coursePath.match(regex))  //&& this.state.filterPath)
    }).filter(course => {
      if (courseIds.has(course.cos_id)) {
        return false;
      } else {
        courseIds.add(course.cos_id);
        return true;
      }
    })
    if (filterTimeSlot  && filterTimeSlot.size != 0) {
      coursesMatch = coursesMatch.filter(course => {
        let cosTime = course.cos_time;
        const cosTimeSlots = decodeCosTime(cosTime);
        if (cosTimeSlots.length === 0) return false;
        if (true) { // FilterSlotAll
          return cosTimeSlots.every(value => filterTimeSlot.includes(value));
        }
        else {
          return cosTimeSlots.some(value => filterTimeSlot.includes(value));
        }
        // const filteredArray = [...this.state.filterTimeSlot].filter(value => cosTimeSlots.includes(value));
        // return filteredArray.length > 0;   
      });
    }
    
    console.log(coursesMatch);
    coursesMatch = coursesMatch.length < 100 ? coursesMatch : coursesMatch.slice(0, 100);
    return coursesMatch;
}
function SearchResult ({ searchWord , filterTimeSlot}) {
  const courseSearchResult = findCourse(searchWord, filterTimeSlot);
  console.log(courseSearchResult);
  if (!courseSearchResult) {
    return ( <></>);
  }
  const resultList = courseSearchResult.map((courseInfo) => {
      const courseSem = courseInfo.sem;
      const courseAcy = courseInfo.acy;
      const courseUrl = `https://timetable.nycu.edu.tw/?r=main/crsoutline&Acy=${courseAcy}&Sem=${courseSem}&CrsNo=${courseInfo.courseId}&lang=zh-tw`;
      return (
        <Box key={courseInfo.cos_id} >
          <Card>
            <CardContent>
            <Typography variant="h5" component="div">
              {courseInfo.cos_cname}
            </Typography>
            <Typography color="text.secondary">
              {courseInfo.coursePath}
            </Typography>
            <Typography color="text.secondary">
              {courseInfo.teacher}
            </Typography>
            <Typography color="text.secondary">
              {courseInfo.cos_time}
            </Typography>
            </CardContent>
            <CardActions>
              <Button onClick={() => {this.setState({courseUrl: courseUrl})}}>課程大綱</Button>
            </CardActions>
          </Card>
        </Box>
      );
  });
  return (
    <Stack>
      {resultList}
    </Stack>
  )
}

function SearchWordFilter() {
  return (
    <Box>
      <FormControlLabel
        control={<Switch />}
        label="只顯示有空堂的課程"
      />
    </Box>
  )
}

function TimeSlotFilter( {setFilterTimeSlot} ) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(new Set());
  console.log(`SelectedTimeSlot ${selectedTimeSlot}`);
  function handleClick (timeSlot) {
    console.log(`${timeSlot} : ${selectedTimeSlot.has(timeSlot)}`)
    if (selectedTimeSlot.has(timeSlot)) {
      selectedTimeSlot.delete(timeSlot)
    }
    else {
      selectedTimeSlot.add(timeSlot)
    }
    setSelectedTimeSlot(new Set([...selectedTimeSlot]));
    setFilterTimeSlot([...selectedTimeSlot])
  }

  const dates = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
  const timeOption = ['y', 'z', '1', '2', '3', '4', 'n', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd'];;

  const timeSlotGrid = dates.map((date) => {
    const timeSlots = timeOption.map((time) => {
      const timeSlot = date+time;
      return (
        <TimeSlotButton timeSlot={timeSlot} selectedTimeSlot={selectedTimeSlot} onClick={handleClick}></TimeSlotButton>
      )
    })
    return ( 
      <Grid item key={date} xs={1}>
        {timeSlots}
      </Grid>
    )
  })
  return (
    <Grid container spacing={1}>
      {timeSlotGrid}
    </Grid>
  )
}

function TimeSlotButton ( {timeSlot, selectedTimeSlot, onClick} ) {
  return (
    <Paper
      sx = {{
        backgroundColor : selectedTimeSlot.has(timeSlot) ? 'green' : 'white'
      }}
      onClick={() => {onClick(timeSlot)}}
    >{timeSlot}</Paper>
  )
}



  // ========================================
  
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SearchTimeTable />);
  