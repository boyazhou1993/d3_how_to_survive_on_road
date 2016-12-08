$(document).ready(function() {

    byYear();

    d3.csv("data/final0.csv", function(error, data) {
        
        var margin = {top: 30, right: 100, bottom: 100, left: 100 },
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var formatDate = d3.time.format("%H");
        var hourScale = d3.time.scale()
                          .domain([formatDate.parse('0'), formatDate.parse('23')])
                          .range([0, width]);

        data.forEach(function(d) {
            d.day = +d.DAY_WEEK;
            d.hour = +d.HOUR;
            d.hourtime = formatDate.parse(d.HOUR);
            d.hourScale = hourScale(formatDate.parse(d.HOUR));
            d.count = +d.FATAL_COUNT;
        });

        byType(data);
        byWeather(data);
        byBehave(behave1=1, behave2=0, behaveData=data);

        // Select state
        var dataNestState = d3.nest()
                              .key(function(d) { return d.STATE; })
                              .entries(data);
        d3.select("#state-select").on("change", changeState);
        function changeState() {
            // remove states that did not appear
            var states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
            // adjust the scale
            var stateScale = d3.scale.ordinal().domain(states).rangePoints([1, 50]);
            var selectedState = stateScale(d3.select('#state-select').property('value'));
            var stateResult = dataNestState.filter(function(d) { return d.key == selectedState; })[0].values;


            // Select type
            var dataNestType = d3.nest()
                                 .key(function(d) { return d.BODY_TYP2; })
                                 .entries(stateResult);
            d3.select("#byTypePie").remove();
            d3.select("#byTypeHeatmap").remove();
            byType(stateResult);
            d3.select("#commute-select").on("change", changeType);
            function changeType() {
                var vehicleType = ["Sedan/Hardtop/2-Door Coupe", "Utility", "Van", "Light Vehicle", "Other", "Truck"];
                var selectType = vehicleType.indexOf(d3.select('#commute-select').property('value')) + 1;
                var typeResult = dataNestType.filter(function(d) { return d.key == selectType; })[0].values;
            };


            // Select weather
            d3.select("#byWeather").remove();
            byWeather(stateResult);


            // Select behavior
            d3.select("#byBehave").remove();
            byBehave(behave1=1, behave2=0, behaveData=stateResult);
            
        };

    });

});


/* Statistics over Years */
/* Data Source: https://en.wikipedia.org/wiki/List_of_motor_vehicle_deaths_in_U.S._by_year */
function byYear() {

    var margin = {top: 30, right: 100, bottom: 100, left: 100 },
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom
    // Format date
    var date = d3.time.format("%Y").parse;

    // Set the range
    var xScale = d3.time.scale().range([0, width]).nice();
    var yScale = d3.scale.linear().range([height, 0]).nice();

    // Define the axis
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Define the line
    var valueLine = d3.svg.line()
                      .x(function(d) { return xScale(d.year); })
                      .y(function(d) { return yScale(d.death); });   

    var svg = d3.select("#byYear")
                .attr('width',width + margin.left + margin.right)
                .attr('height',height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tip = d3.select("#vis-byYear")
                .append("div")
                .attr("class", "tooltip-year")
                .style("opacity", 0);

    // Load the data over years
    d3.csv("data/byYear.csv", function(err, data) {
        
        data.forEach(function(d) {
            d.year = +date(d.Year);
            d.death = +d.Deaths;
            d.pop = +d.Population;
        });

        var dataZoomed = data.slice(109);
        
        // Scale the range of the data
        xScale.domain(d3.extent(data, function(d) { return d.year; }));
        yScale.domain([0, d3.max(data, function(d) { return d.death; })]);

        // Add the valueLine path
        svg.append("path")
           .attr("class", "year-trend")
           .attr("d", valueLine(data))
           .attr("fill", "none")
           .attr("stroke", "gray")
           .attr("stroke-width", "2");

        // Add the scatterplot (dots)
        svg.selectAll(".year-dot")
           .data(data)
           .enter()
           .append("circle")
           .attr("class", "year-dot")
           .attr("r", function(d) {
               if (d.Year == 2015) { return 6; }
               else { return 3; };
           })
           .attr("cx", function(d) { return xScale(d.year); })
           .attr("cy", function(d) { return yScale(d.death); })
           .attr("fill", function(d) {
               if (d.Year == 2015) { return "#1abc9c"; }
               else { return "gray"};
           })
           .on("mouseenter", function() {
               d3.select(this)
                 .transition()
                 .attr("r", function(d) {
                     if (d.Year == 2015) { return 9; }
                     else { return 6; };
                 });
           })
           .on("mouseleave", function() {
               d3.select(this)
                 .transition()
                 .attr("r", function(d) {
                     if (d.Year == 2015) { return 6; }
                     else { return 3; };
                 });
           })
           .on("mouseover", function(d) {
               tip.transition()
                  .duration(200)
                  .style("opacity", 0.8);
               tip.html("<b>" + d.Year + "</b><br/>" + d.death)
                  .style("left", (d3.event.pageX - 30) + "px")
                  .style("top", (d3.event.pageY - 40) + "px");
           })
           .on("mouseout", function(d) {
               tip.transition()
                  .duration(500)
                  .style("opacity", 0);
           })
           .on("click", function(d) {
               if (d.Year == 2015) {
                   zoomIn();
                   //return pie2015();
               };
           });

        // Add the X Axis
        svg.append("g")
           .attr("class", "axis")
           .attr("id", "x-axis")
           .attr("transform", "translate(0, " + height + ")")
           .call(xAxis);

        // Add the Y Axis
        svg.append("g")
           .attr("class", "axis")
           .attr("id", "y-axis")
           .call(yAxis);

        function zoomIn() {
            d3.selectAll(".year-dot").remove();

            // First transition the line to the last six years
            var t0 = svg.transition().duration(750);
            t0.selectAll(".year-trend").attr("d", valueLine(dataZoomed));

            // Then transition the x-axis
            xScale.domain(d3.extent(dataZoomed, function(d) { return d.year; }));
            yScale.domain(d3.extent(dataZoomed, function(d) { return d.death; }));
            svg.selectAll(".year-dot2")
               .data(dataZoomed)
               .enter()
               .append("circle")
               .attr("class", "year-dot2")
               .attr("r", function(d) {
                   if (d.Year == 2015) { return 6; }
                   else { return 3; };
               })
               .attr("cx", function(d) { return xScale(d.year); })
               .attr("cy", function(d) { return yScale(d.death); })
               .attr("fill", function(d) {
                   if (d.Year == 2015) { return "#1abc9c"; }
                   else { return "gray"};
                })
               .style("opacity", 0)
               .on("mouseenter", function() {
                    d3.select(this)
                    .transition()
                    .attr("r", function(d) {
                        if (d.Year == 2015) { return 9; }
                        else { return 6; };
                    });
                })
                .on("mouseleave", function() {
                    d3.select(this)
                      .transition()
                      .attr("r", function(d) {
                          if (d.Year == 2015) { return 6; }
                          else { return 3; };
                       });
                 })
                 .on("mouseover", function(d) {
                     tip.transition()
                        .duration(200)
                        .style("opacity", 0.8);
                     tip.html("<b>" + d.Year + "</b><br/>" + d.death)
                        .style("left", (d3.event.pageX - 30) + "px")
                        .style("top", (d3.event.pageY - 40) + "px");
                  })
                  .on("mouseout", function(d) {
                      tip.transition()
                      .duration(500)
                      .style("opacity", 0);
                   });

            var t1 = t0.transition();
            t1.selectAll(".year-trend").attr("d", valueLine(dataZoomed));
            t1.selectAll("#x-axis").call(xAxis);
            t1.selectAll("#y-axis").call(yAxis);

            // Third transition the dots
            svg.selectAll(".year-dot2")
               .transition()
               .delay(750)
               .duration(750)
               .style("opacity", 1);

        }
        
    });
};

function byState() {
    // some states did not appear in the dataset
    // Pls remember to remove those statesName from section.js and
    // states and stateScale in the main function in script.js
}

/* Statistics by Vehicle Type and Fatality Number */
function byType(typeDate) {

    var data = (JSON.parse(JSON.stringify(typeDate)));

    var margin = {top: 30, right: 100, bottom: 100, left: 100 },
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        radius = (400 - margin.top)/3;
        gridSize = Math.floor(width / 28),
        legendElementWidth = gridSize*2,
        buckets = 10,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58", "#000000"], // alternatively colorbrewer.YlGnBu[9]
        colorsPie = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6"],
        colorsFatal = ["#c7e9b4", "#41b6c4", "#081d58"],
        days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
        vehicleType = ["Sedan/Hardtop/2-Door Coupe", "Utility", "Van", "Light Vehicle", "Other", "Truck"],
        fatalNum = ["1", "2", ">2"];


    var svgPie = d3.select("#typeDiv")
                   .append("svg")
                   .attr("id", "byTypePie")
                   .attr("height", 400)
                   .attr("width", 1000)
                   .append("g")
                   .attr("transform", "translate(" + (radius+3*margin.left) + "," + (radius+3*margin.top) + ")");
    
    var svgHeatmap = d3.select("#typeDiv")
                       .append("svg")
                       .attr("id", "byTypeHeatmap")
                       .attr("height", 400)
                       .attr("width", 1000)
                       .append("g")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dayLabels = svgHeatmap.selectAll(".dayLabel")
                       .data(days)
                       .enter()
                       .append("text")
                       .text(function (d) { return d; })
                       .attr("x", 0)
                       .attr("y", function (d, i) { return i * gridSize; })
                       .style("text-anchor", "end")
                       .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                       .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svgHeatmap.selectAll(".timeLabel")
                        .data(times)
                        .enter()
                        .append("text")
                        .text(function(d) { return d; })
                        .attr("x", function(d, i) { return i * gridSize; })
                        .attr("y", 0)
                        .style("text-anchor", "middle")
                        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });



        /**************** Pie charts: for vehicle type with different level of fatality  *********************/
        var dataNest1 = d3.nest()
                          .key(function(d) { return d.BODY_TYP2; })
                          .rollup(function(i) { return i.length; })
                          .entries(data);
        //console.log(dataNest1);

        var colorPie = d3.scale.ordinal()
                         .domain(["1", "2", "3", "4", "5", "6"])
                         .range(colorsPie);
    
        // Arc for vehicle type
        var arcType = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(radius/3)
                        .padAngle(.02);

        var pieType = d3.layout.pie()
                        .sort(null)
                        .value(function(d) { return d.values; });

        var pie1 = pieType(dataNest1);

        var tip = d3.select("#vis-byType")
                    .append("div")
                    .attr("class", "tooltip-type");

        var typeScale = d3.scale.ordinal()
                          .domain(["1", "2", "3", "4", "5", "6"])
                          .range(vehicleType);

        var arcsType = svgPie.selectAll(".arcsType")
                             .data(pieType(dataNest1))
                             .enter()
                             .append("path")
                             .attr("class", "arcsType")
                             .attr("id", function(d) { return 'type'+d.data.key; })
                             .attr("d", arcType)
                             .style("fill", function(d) { return colorPie(d.data.key); })
                             .on("mouseover", function(d) {
                                 var percent = d3.format(",.2%")((d.endAngle - d.startAngle) / 6.283185307179586);
                                 tip.html("<b>" + typeScale(d.data.key) + "</b><br/>" + d.value + "<br/>" + percent)
                                    .style('top', (d3.event.pageY + 10) + 'px')
                                    .style('left', (d3.event.pageX + 10) + 'px')
                                    .style("display", "block");
                                })
                             .on("mouseout", function(d) {
                                 tip.style("display", "none");
                                });
        
        var legendPie = svgPie.selectAll(".legend-pie")
                              .data(vehicleType)
                              .enter()
                              .append("g")
                              .attr("class", "legend-pie");
        
        legendPie.append("rect")
                 .attr("x", width / 4 + 50)
                 .attr("y", function(d, i) { return i * 25 - 150; })
                 .attr("height", 20)
                 .attr("width", 30)
                 .style("fill", function(d, i) { return colorsPie[i]; });

        legendPie.append("text")
                 .attr("class", "mono-pie")
                 .text(function(d) { return d; })
                 .attr("x", width / 4 + 90)
                 .attr("y", function(d, i) { return i * 25 - 135; });




        var colorLvl = d3.scale.ordinal().domain(fatalNum).range(colorsFatal);

        var dataNest2 = d3.nest()
                         .key(function(d) { return d.BODY_TYP2; })
                         .key(function(d) { return d.FATAL_LEVEL; })
                         .rollup(function(d) {
                             return d.length;
                         })
                         .entries(data);

        // Compute the start and end angle for fatality levels for each vehicle type
        dataNest2.forEach(function(d, i) {
            d.values[0].startAngle = pie1[i].startAngle;
            d.values[0].endAngle = d.values[0].startAngle + d.values[0].values * (pie1[i].endAngle - pie1[i].startAngle) / pie1[i].value;
            if ((d.values).length > 1) {
                d.values[1].startAngle = d.values[0].endAngle;
                d.values[1].endAngle = d.values[1].startAngle + d.values[1].values * (pie1[i].endAngle - pie1[i].startAngle) / pie1[i].value;
                if ((d.values).length > 2) {
                    d.values[2].startAngle = d.values[1].endAngle;
                    d.values[2].endAngle = d.values[2].startAngle + d.values[2].values * (pie1[i].endAngle - pie1[i].startAngle) / pie1[i].value;
                };
            };
        });
    
        // Arc for vehicle type
        var arcLvl = d3.svg.arc()
                        .startAngle(function(d) { return d.startAngle; })
                        .endAngle(function(d) { return d.endAngle; })
                        .outerRadius(radius + 2*margin.top)
                        .innerRadius(radius - 5)
                        .padAngle(.005);

        var arcsLvl = svgPie.selectAll(".arcsLvl");

        dataNest2.forEach(function(d, i) {
            console.log((d.values).length);
            arcsLvl.data(d.values)
                   .enter()
                   .append("path")
                   .attr("class", "arcsLvl"+d.key)
                   .attr("id", function(g) { return 'lvl'+g.key; })
                   .attr("d", arcLvl)
                   .style("fill", function(g) { return colorLvl(g.key); })
                   .style("opacity", 0.7);
        });

        var legendFatal = svgPie.selectAll(".legend-fatal")
                              .data(fatalNum)
                              .enter()
                              .append("g")
                              .attr("class", "legend-fatal");
        
        legendFatal.append("rect")
                 .attr("x", width / 4 + 50)
                 .attr("y", function(d, i) { return i * 25 + 50; })
                 .attr("height", 20)
                 .attr("width", 30)
                 .style("fill", function(d, i) { return colorsFatal[i]; });

        legendFatal.append("text")
                 .attr("class", "mono-pie")
                 .text(function(d, i) { return "Traffic Death Toll: " + fatalNum[i]; })
                 .attr("x", width / 4 + 90)
                 .attr("y", function(d, i) { return i * 25 + 65; });
        
        legendFatal.style("display", "block");


        
        /************************** Heatmap: for the chosen vehicle type *************************/
        var dataNest3 = d3.nest()
                          .key(function(d) { return d.BODY_TYP2; })
                          .key(function(d) { return d.day; })
                          .key(function(d) { return d.hour; })
                          .rollup(function(d) {
                              return d3.sum(d, function(v) { return v.count; });
                          })
                          .entries(data);

        var colorHeatmap = d3.scale.quantile()
                             .domain([0, buckets-1, 250])
                             .range(colors);

        dataNest3.forEach(function(d, i) {     
            d.values.forEach(function(g, ii) {
                g.values.forEach(function(v, iii) {
                    svgHeatmap.selectAll("hour-bordered-" + i)
                     .data(d.values)
                     .enter()
                     .append("rect")
                     .attr("x", v.key * gridSize)
                     .attr("y", (g.key - 1) * gridSize)
                     .attr("rx", 4)
                     .attr("ry", 4)
                     .attr("class", "hour-bordered-" + i)
                     .attr("width", gridSize - 3)
                     .attr("height", gridSize - 3)
                     .style("fill", colorHeatmap(v.values))
                     .style("opacity", 0);
                });
            });
        });

        // Define the legend
        var legendHeatmap = svgHeatmap.selectAll(".legend-heatmap")
                            .data([25, 50, 75, 100, 125, 150, 175, 200, 225, 250])
                            .enter()
                            .append("g")
                            .attr("class", "legend-heatmap");

        legendHeatmap.append("rect")
                  .attr("x", function(d, i) { return legendElementWidth * i; })
                  .attr("y", height)
                  .attr("width", legendElementWidth)
                  .attr("height", gridSize / 2)
                  .style("fill", function(d, i) { return colors[i]; });

        legendHeatmap.append("text")
                 .attr("class", "mono-heatmap")
                 .text(function(d) { return "<= " + d; })
                 .attr("x", function(d, i) { return legendElementWidth * (i+1)-15; })
                 .attr("y", height + gridSize);

        highlightMap(0);


        d3.select('#commute-select')
          .on('change', commuteChange);

        function commuteChange(){
            var commuteMode = ['-- Select Vehicle Type --',
		               'Sedan/Hardtop/2-Door Coupe',
	                   'Utility',
					   'Van',
					   'Light Vehicle',
					   'Other',
					   'Truck'];
		    var commuteState = d3.select('#commute-select').property('value');
		    var index = commuteMode.indexOf(commuteState);
		    console.log(index);
		    highlightType(index);
	    };

        function highlightType(index) {

            var blurList =  [0,1,2,3,4,5];

            if (index == 0) {
        
                // Dealing with pie
                d3.selectAll(".arcsType")
                  .transition()
                  .duration(500)
                  .style("opacity", 1);
                blurList.forEach(function(d) {
                    d3.selectAll(".arcsLvl" + (d + 1))
                      .transition()
                      .duration(500)
                      .style("opacity", 0.7);
                });
        
                // Dealing with heatmap
                highlightMap(0);
            }
        
            else {
                blurList.splice(index - 1, 1);
                blurList.forEach(function(d, i) {
                    // Dealing with pie
                    d3.selectAll("#type" + (d + 1))
                      .transition()
                      .duration(500)
                      .style("opacity", 0.2);
                    d3.selectAll(".arcsLvl" + (d + 1))
                      .transition()
                      .duration(500)
                      .style("opacity", 0.1);
                    // Dealing with heatmap
                    blurMap(d);
                });
            
                d3.selectAll("#type" + index)
                  .transition()
                  .duration(500)
                  .style("opacity", 1);
                d3.selectAll(".arcsLvl" + index)
                  .transition()
                  .duration(500)
                  .style("opacity", 0.7);
                highlightMap(index - 1);
            };
        };
};

function highlightMap(index) {
    d3.selectAll(".hour-bordered-" + index)
      .transition()
      .duration(500)
      .style("opacity", 1);
};

function blurMap(index) {
    d3.selectAll(".hour-bordered-" + index)
      .transition()
      .duration(500)
      .style("opacity", 0);
};

/* Statistics by Weather and Fatality Number */
function byWeather(weatherData) {

    var data = (JSON.parse(JSON.stringify(weatherData)));

    var margin = {top: 30, right: 100, bottom: 100, left: 100 },
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        padding = 50;

    // Define the scales
    var timeFormat = d3.time.format('%I %p'),
        formatHours = function(d) { return timeFormat(new Date(2015, 1, 1, d)); };

    var xScale = d3.scale.linear()
                          .domain([0, 24])
                          .range([0, width]);

    var yScale = d3.scale.linear()
                         .domain([0.8, 2.2])
                         .range([height, 0]);

    // Define the axis
    var xAxis = d3.svg.axis().scale(xScale)
                             .orient("bottom")
                             .tickValues([0,3,6,9,12,15,18,21,24])
                             .tickFormat(formatHours);

    
    var yAxis = d3.svg.axis().scale(yScale)
                             .orient("left")
                             .tickValues([1.0, 1.3, 1.6, 1.9, 2.2]);

    var color = d3.scale.category20();

    var svg = d3.select("#svg-weather")
                .append("svg")
                .attr("id", "byWeather")
                .attr("height", height + margin.top + margin.bottom)
                .attr("width", width + margin.left + margin.right)
                .append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define the line
    var weatherLine = d3.svg.line()
                        .x(function(d) { return d.values.hourScale; })
                        .y(function(d) { return yScale(d.values.avg); });

    // Group data by weather
    var dataNest = d3.nest()
                     .key(function(d) { return d.WEATHER; })
                     .key(function(d) { return d.hourtime; }).sortKeys(d3.ascending)
                     .rollup(function(d) {
                         return {
                             hourScale: d3.mean(d, function(v) { return v.hourScale; }),
                             avg: d3.sum(d, function(v) { return v.count; }) / d.length
                         };
                     })
                     .entries(data);
    
    // froEach means drawing line for each key
    dataNest.forEach(function(d, i) {
        //console.log(d.values);
        svg.append("path")
           .attr("class", "weatherLine")
           .style("stroke", function() { return color(d.key); })
           .style("stroke-width", 3)
           .attr("opacity", 1)
           .attr("id", 'weather'+d.key)
           .attr("d", weatherLine(d.values))
           .attr("fill", "none");


    });

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + 0 + "," + height + ")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "axis")
       .call(yAxis);

    // svg.append("text")
    //    .attr("x", 60)
    //    .attr("y", 60)
    //    .text("Average Death per Accident");
         
}

function highlightLine() {

    var svg = d3.select("#byWeather");
    weatherVar = document.getElementById('weatherVar').value;

    if (weatherVar == 0) {
        svg.selectAll(".weatherLine")
           .transition()
           .duration(600)
           .ease("linear")
           .attr("opacity", 1)
           .style("stroke-width", 3);
    }
    else {
        // Blur other lines
        svg.selectAll(".weatherLine")
           .transition()
           .duration(600)
           .ease("linear")
           .attr("opacity", 0.3)
           .style("stroke-width", 3);

        // Highlight the chosen weather line
        svg.select("#weather"+weatherVar)
           .transition()
           .duration(600)
           .ease("linear")
           .attr("opacity", 1)
           .style("stroke-width", 7);
    };
 
};

/* Statistics by Bad Behaviors */
function byBehave(behave1 = 1, behave2 = 0, behaveData) {

    var data = (JSON.parse(JSON.stringify(behaveData)));

    var margin = {top: 30, right: 100, bottom: 100, left: 100 },
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        barPadding = 22.5;

    var behaveDataNest = d3.nest()
                           .key(function(d) { return d.SPEEDREL2; })
                           .key(function(d) { return d.MDRDSTRD2; })
                           .key(function(d) { return d.DAY_WEEK; }).sortKeys(d3.ascending)
                           .rollup(function(d) {
                               // return average death per accident
                               return d3.sum(d, function(g) { return g.count; }) / d.length;
                           })
                           .entries(data);

    function chosenBehave(behave1, beheve2) {
        var behaveDataNestChosen = behaveDataNest.filter(function(d) { return d.key == behave1; })[0].values
                                             .filter(function(g) { return g.key == behave2; })[0].values;
        return behaveDataNestChosen;
    }; 
    
    var behaveDataNestChosen = chosenBehave(behave1, behave2);
    var behaveDataNestDefault = chosenBehave(0, 0);

    // Define the scales
    var timeFormat = d3.time.format('%a'),
        formatYear = function(d) { return timeFormat(new Date(2015, 1, d)); };

    // Set the range
    var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1).domain([1,2,3,4,5,6,7]);
    var yScale = d3.scale.linear().range([height, 0]).domain([0.9, 1.3]);

    // Define the axis
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(formatYear);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(6);

    // Define the bar
    var svgBehave = d3.select("#behaveDiv")
                      .append("svg")
                      .attr("id", "byBehave")
                      .attr("height", height + margin.top + margin.bottom)
                      .attr("width", width + margin.left + margin.right)
                      .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svgBehave.selectAll(".bar-behave-chosen")
             .data(behaveDataNestChosen)
             .enter()
             .append("rect")
             .attr("class", "bar-behave-chosen")
             .attr("x", function(d) { return barPadding + xScale(d.key); })
             .attr("y", function(d) { return yScale(d.values); })
             .attr("width", 50)
             .attr("height", function(d) { return height - yScale(d.values); })
             .style("fill", "#999999");

    svgBehave.selectAll(".bar-behave-default")
             .data(behaveDataNestDefault)
             .enter()
             .append("rect")
             .attr("class", "bar-behave-default")
             .attr("x", function(d) { return barPadding + xScale(d.key); })
             .attr("y", function(d) { return yScale(d.values); })
             .attr("width", 50)
             .attr("height", function(d) { return height - yScale(d.values); })
             .style("fill", "#1abc9c");

    // Add the Y Axis
    svgBehave.append("g")
             .attr("class", "axis")
             .attr('transform',"translate(" + 0 + "," + height + ")")
             .call(xAxis);    
    // Add the Y Axis
    svgBehave.append("g")
             .attr("class", "axis")
             .call(yAxis);

    svgBehave.append("text")
             .attr("x", 10)
             .attr("y", 10)
             .text("Average Death per Accident");

    d3.select("#btnOperate")
      .on("click", clickSubmit);

    function clickSubmit(data=behaveDataNest) {
    
        var speeding = document.getElementById("checkbox1").checked ? 1 : 0,
            distracted = document.getElementById("checkbox2").checked ? 1 : 0;
   
        function chosenBehave(speeding, distracted) {
            var behaveDataNestChosen = data.filter(function(d) { return d.key == speeding; })[0].values
                                           .filter(function(g) { return g.key == distracted; })[0].values;
            return behaveDataNestChosen;
        };    
    
        d3.selectAll(".bar-behave-chosen")
          .data(chosenBehave(speeding, distracted))
          .transition()
          .duration(750)
          .attr("x", function(d) { return 10 + xScale(d.key); })
          .attr("y", function(d) { return yScale(d.values); })
          .attr("width", 50)
          .attr("height", function(d) { return height - yScale(d.values); })
          .style("fill", "#999999")
    };             

};



