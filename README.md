Final Project - Interactive Data Visualization  
===
### Team

- Boya Zhou (bzhou@wpi.edu, github: boyazhou1993) 
- Caidan Liu (cliu7@wpi.edu, github: CaidanLiu2) 
- Yuting Liang (yliang3@wpi.edu, github: DarienLiang)

### Project Website

Adjust the screen resolution to get more comfortable layout.

[Link to Project](https://boya-zhou.github.io/d3_how_to_survive_on_road/index.html)

### Process Book

[Link to Process Book](https://github.com/boyazhou1993/d3_how_to_survive_on_road/blob/master/ProcessBook.pdf) 

### Guide to Process Book

Process book is too long, simple guideline here:

- 1. Motivation: people dead more on road in last year by several years' decreasing.
- 2. Objectives: Traffic Death Toll by several features(commute mode, weather and bad driving behaviour)
- 3.2 Data Processing: hard to summrize
- 3.3 Data Flow: worth reading here, we make a big change in Data Flow
- 4.1 Proposal design : same with proposal
- 4.2 Final Design: hard to summrize
- 5 Evaluation: worth reading here
- 6 Reference


### Project Screen-Cast

[Link to Screen-Cast](https://github.com/boyazhou1993/d3_how_to_survive_on_road/blob/master/dataVisFinal_Yuting_Boya_Caidan.mp4)


### Contribution

Yuting Liang(DarienLiang): 

- majority process data in python and d3, make 1st, 3rd, 4nd, 5nd views with transitions, change data flow, and 50% logic functions
- part of process book, video

Boya Zhou(boyazhou1993):

- make 2nd view, website layout, unify views format, (based on yuting's work)test website, add 50% logic functions, part modify data in d3, css style
- part of process book, video

Caidan Liu(CaidanLiu2):

- part of process data
- part of process book, video

### Library
- d3: in js file
- JQuery: in js file
- bootstrap: in css file

### Data Resources

[2015 traffic fatalities released by the the National Highway Traffic Safety Administration](https://www.whitehouse.gov/blog/2016/08/29/2015-traffic-fatalities-data-has-just-been-released-call-action-download-and-analyze).

### Several Details
- When choose some states, some mode in commute part do not exist, try Alaska, then try to select in commute part, the truck option is disabled. If choose other state, the truck option will back to alive.
- When user select other states, the following option change to its origin states.
- The last three view are all can be looped use.
- When select certain states, a line will show under the box.
- Dynamic axis range in last two views

### References
---

- http://www.injuryclaimcoach.com/multi-vehicle-accident.html
- http://www.ohiotiger.com/suvs-vs-cars-crash-survival/
- http://journalistsresource.org/studies/environment/transportation/comparing-fatality-risks-united-states-transportation-across-modes-time
