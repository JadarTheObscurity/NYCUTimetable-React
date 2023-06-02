import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import coursesData from './result.json'
import TextField from '@mui/material/TextField'
import {Box, Button, Card, FormControlLabel, List, ListItem, ListItemButton, ListItemText, Stack, Switch, Typography, CardActions, CardContent} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import Container from '@mui/material/Container'

class SearchBar extends React.Component {
  constructor (props){
    super(props);
    this.state = {
      courses: coursesData
    };
  }
  render() {
    return (
      <>
        <TextField placeholder='課程名稱或授課老師' onChange={event => this.props.onSearch(event.target.value)}/>
      </>
    )

  }
}

class Search extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      keyWord: null,
      courseSearchResult: null,
      courseUrl: null,
      filterCourse: true,
      filterTeacher: false,
      filterPath: false
    }
  }


  renderCourseList() {
    if (!this.state.courseSearchResult) {
      return null
    }

    const resultList = this.state.courseSearchResult.map((courseInfo) => {
      const courseSem = courseInfo.courseSemester.substr(courseInfo.courseSemester.length-1, 1)
      const courseAcy = courseInfo.courseSemester.substr(0, courseInfo.courseSemester.length-1)
      const courseUrl = `https://timetable.nycu.edu.tw/?r=main/crsoutline&Acy=${courseAcy}&Sem=${courseSem}&CrsNo=${courseInfo.courseId}&lang=zh-tw`;
      return (
        <Box key={courseInfo.courseId} >
          <Card>
            <CardContent>
            <Typography variant="h5" component="div">
              {courseInfo.courseName}
            </Typography>
            <Typography color="text.secondary">
              {courseInfo.coursePath}
            </Typography>
            <Typography color="text.secondary">
              {courseInfo.courseTeacher}
            </Typography>
            <Typography color="text.secondary">
              {courseInfo.courseTime}
            </Typography>
            </CardContent>
            <CardActions>
              <Button onClick={() => {this.setState({courseUrl: courseUrl})}}>課程大綱</Button>
            </CardActions>
          </Card>
        </Box>
      );
      // return (
      //     <List key={courseInfo.courseId}>
      //       <ListItem disablePadding>
      //         <ListItemButton onClick={() => {this.setState({courseUrl: courseUrl})}}>
      //           <ListItemText 
      //             primary={courseInfo.courseName} 
      //             secondary={
      //               <React.Fragment>
      //               <p>{courseInfo.coursePath}</p>
      //               <p>{courseInfo.courseTeacher}</p>
      //               <p>{courseInfo.courseTime}</p>
      //               </React.Fragment>
      //             }
      //           />
      //         </ListItemButton>
      //       </ListItem>
      //     </List>
      // );
    })
    return (
      <Stack>
       {resultList} 
      </Stack>
      );
  }

  renderCourseUrl() {
    return (
      <iframe className="courseIframe" src={this.state.courseUrl}></iframe>
    )
  }
  handleFilterSwitch(event) {
    console.log(this)
    console.log(event);
  }

  render() {
    // Search the course with the name
    let resultList = this.renderCourseList();

    return ( 
      <> 
        <Grid container spacing={2}
        >
          <Grid xs={5} height={"700px"}>
            <Container>
              <Stack>
                <SearchBar onSearch={this.findMatch.bind(this)}/>
                <Box>
                  <FormControlLabel control={<Switch defaultChecked onChange={(event) => {
                    console.log(event.target.checked);
                    this.setState({filterCourse: event.target.checked}, () => {this.findMatch(this.state.keyWord)});
                  }}/>} label="課程名稱" />
                  <FormControlLabel control={<Switch onChange={(event) => {
                    this.setState({filterTeacher: event.target.checked}, () => {this.findMatch(this.state.keyWord)});
                  }}/>} label="授課老師" />
                      <FormControlLabel control={<Switch onChange={(event) => {
                        this.setState({filterPath: event.target.checked}, () => {this.findMatch(this.state.keyWord)});
                  }}/>} label="課程路徑" />
                    </Box>
              </Stack>
              {resultList}
            </Container>
          </Grid>
          <Grid xs={7}>
              {this.renderCourseUrl()}
          </Grid>
      </Grid>
      </>

    );
  }
  findMatch(searchWord) {
    console.log(this.state)
    if (searchWord === '') {
      this.setState({courseSearchResult: null});
      return
    }
    this.setState({keyWord: searchWord});
    const regex = RegExp(`${searchWord}`, "gi");
    let coursesMatch = coursesData.filter(course => {
      return (course.courseName.match(regex) && this.state.filterCourse) ||
      (course.courseTeacher.match(regex) && this.state.filterTeacher) ||
      (course.coursePath.match(regex) && this.state.filterPath)
    })
    console.log(coursesMatch);
    coursesMatch = coursesMatch.length < 100 ? coursesMatch : coursesMatch.slice(0, 100);
    this.setState({courseSearchResult: coursesMatch});
  }
}
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Search />);
  