import coursesData from './result.json'
function findCourse(searchWord) {
    searchWord = searchWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (searchWord === '') {
      return null;
    }

    // console.log(this.state)
    // if (searchWord === '' && this.state.filterTimeSlot.size === 0) {
    //   this.setState({courseSearchResult: null});
    //   return
    // }
    // this.setState({searchWord: searchWord});
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
    return coursesMatch;
}

module.exports.findCourse = findCourse;