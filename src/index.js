import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import coursesData from './result.json'
import TextField from '@mui/material/TextField'
import {Box, Button, Card, FormControlLabel, List, ListItem, ListItemButton, ListItemText, Stack, Switch, Typography, CardActions, CardContent, Paper} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import Container from '@mui/material/Container'

class SearchBar extends React.Component {
  render() {
    return (
      <TextField placeholder='課程名稱或授課老師' onChange={event => this.props.onSearch(event.target.value)}/>
    )
  }
}

class TimeSlotButton extends React.Component {
  constructor(props) {
    super(props);
    this.selected = false;
  }
  render() {
    return (
      <Paper onClick={this.handleClick.bind(this)} sx={{
        backgroundColor: this.selected ? 'green' : 'white',
      }}>{this.props.timeslot}</Paper>
    )
  }

  handleClick(e) {
    console.log(e);
    console.log(this.props.timeslot);
    console.log(this.selected);
    this.selected = !this.selected;
    this.props.onClick(this.props.timeslot, this.selected);
  }
}

class FilterTimeSlot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTimeSlot: new Set(),

    }
  }

  render() {
    const dates = ['M', 'T', 'W', 'R', 'F', 'S', 'U']
    const timeSlotsGrid = dates.map((date) => {
      return (
        <Grid item xs={1}>
          <Stack>
            {this.createTimeSlot(date)}
          </Stack>
        </Grid>
      )
    })
    return (
      <Box>
        <Grid container>
          {timeSlotsGrid}
        </Grid>
      </Box>
    );
  }

  createTimeSlot(date) {
    let timeSlots = [];
    const timeSlotsOption = ['y', 'z', '1', '2', '3', '4', 'n', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd'];
    timeSlotsOption.forEach((time) => {
      timeSlots.push(
        <TimeSlotButton timeslot={date + time} onClick={this.handleTimeSlotButtonClicked.bind(this)}/>
      )

    });
    return timeSlots;
  }
  
  handleTimeSlotButtonClicked = (timeslot, selected) => {
    console.log(timeslot);
    if (selected && !this.state.selectedTimeSlot.has(timeslot)) {
      this.state.selectedTimeSlot.add(timeslot);
    }
    else if (!selected && this.state.selectedTimeSlot.has(timeslot)) {
      this.state.selectedTimeSlot.delete(timeslot);
    }

    // setTimeSlot(timeslot);
    this.props.onSelectFilterTimeSlot(this.state.selectedTimeSlot);
  }

}

class SearchResult extends React.Component {
  render() {
    return this.renderCourseList();

  }
  renderCourseList() {
    if (!this.props.courseSearchResult) {
      return null
    }

    const resultList = this.props.courseSearchResult.map((courseInfo) => {
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
    })
    return (
      <Stack>
        <Typography>
          搜尋結果：{this.props.courseSearchResult.length} 堂課
        </Typography>
       {resultList} 
      </Stack>
      );
  }

}

class Search extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      searchWord: "",
      courseSearchResult: null,
      courseUrl: null,
      filterCourse: true,
      filterTeacher: false,
      filterPath: false,
      filterTimeSlot: new Set(),
      filterTimeSlotAll: true, // true: filterTimeSlot is all, false: filterTimeSlot is any
    }
  }

  render() {
    // Search the course with the name
    // let resultList = this.renderCourseList();

    return ( 
      <> 
        <Grid container spacing={2}>
          <Grid xs={5} height={"700px"}>
            <Container>
              <Stack>
                <SearchBar onSearch={this.handleSearch.bind(this)}/>
                <Box>
                  <FormControlLabel control={<Switch defaultChecked onChange={(event) => {
                    console.log(event.target.checked);
                    this.setState({filterCourse: event.target.checked}, () => {this.findMatch(this.state.searchWord)});
                  }}/>} label="課程名稱" />
                  <FormControlLabel control={<Switch onChange={(event) => {
                    this.setState({filterTeacher: event.target.checked}, () => {this.findMatch(this.state.searchWord)});
                  }}/>} label="授課老師" />
                      <FormControlLabel control={<Switch onChange={(event) => {
                        this.setState({filterPath: event.target.checked}, () => {this.findMatch(this.state.searchWord)});
                  }}/>} label="課程路徑" />
                    </Box>
              </Stack>
              <SearchResult courseSearchResult={this.state.courseSearchResult}/>
              {/* {resultList} */}
            </Container>
          </Grid>
          <Grid xs={7}>
            <FilterTimeSlot onSelectFilterTimeSlot={this.handleFilterTimeSlot}/>
          </Grid>
      </Grid>
      </>

    );
  }

  handleFilterSwitch(event) {
    console.log(this)
    console.log(event);
  }

  handleFilterTimeSlot = (filterTimeSlot) => {
    console.log(`handleFilterTimeSlot: ${[...filterTimeSlot]}`)
    this.setState({filterTimeSlot: filterTimeSlot}, () => {this.findMatch(this.state.searchWord)});
  }
  
  handleSearch(searchWord) {
    this.findMatch(searchWord);

  }

  findMatch(searchWord) {
    searchWord = searchWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    console.log(this.state)
    if (searchWord === '' && this.state.filterTimeSlot.size === 0) {
      this.setState({courseSearchResult: null});
      return
    }
    this.setState({searchWord: searchWord});
    const regex = RegExp(`${searchWord}`, "gi");
    let courseIds = new Set();
    let coursesMatch = coursesData.filter(course => {
      return (course.cos_cname.match(regex) && this.state.filterCourse) ||
      (course.teacher.match(regex) && this.state.filterTeacher) ||
      (course.coursePath.match(regex) && this.state.filterPath)
    }).filter(course => {
      if (courseIds.has(course.cos_id)) {
        return false;
      } else {
        courseIds.add(course.cos_id);
        return true;
      }
    })

    // Filter date
    if (this.state.filterTimeSlot  && this.state.filterTimeSlot.size != 0) {
      coursesMatch = coursesMatch.filter(course => {
        let cosTime = course.cos_time;
        const cosTimeSlots = this.decodeCosTime(cosTime);
        if (cosTimeSlots.length === 0) return false;
        if (this.state.filterTimeSlotAll) {
          return cosTimeSlots.every(value => this.state.filterTimeSlot.has(value));
        }
        else {
          return cosTimeSlots.some(value => this.state.filterTimeSlot.has(value));
        }
        // const filteredArray = [...this.state.filterTimeSlot].filter(value => cosTimeSlots.includes(value));
        // return filteredArray.length > 0;   
      });
    }
    
    console.log(coursesMatch);
    coursesMatch = coursesMatch.length < 100 ? coursesMatch : coursesMatch.slice(0, 100);
    this.setState({courseSearchResult: coursesMatch});
  }
  decodeCosTime(cosTime) {
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

}
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Search />);
  