arg1=0;
 arg2=0;
 arg3=0;
 find_state=1;

$('#inputbutton').click(function(){
 

var temp = $('#inputValue').val();//get the value
 find_state=temp;
    d3.csv("data/pie_chart1.csv",function(error,csvdata){  
      
        if(error){  
            console.log(error);  
        }  
        
		for( var i=0; i<csvdata.length; i++ ){  
    var state = csvdata[i].STATE;  
    var fatal_count = csvdata[i].FATAL_COUNT;  
    var total_count = csvdata[i].TOTAL_COUNT;  


				 if(state==find_state && fatal_count==1)
				 arg1= total_count;
				  if(state==find_state && fatal_count==2)
				 arg2= total_count;
				  if(state==find_state && ">2"==fatal_count)
				 arg3= total_count;
          
    }
	 console.log(arg1+"---"+arg2+"---"+arg3);
	//  secondStep(780,340,222);
	});  
   
});


var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/bar_chart1.csv", function(error, data) {
  if (error) throw error;
   // console.log(data);  

  var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "State"; });

  data.forEach(function(d) {
    d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
  });

  x0.domain(data.map(function(d) { return d.State; }));
  x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("acc_count");

  var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "state")
      .attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)"; })
      
       .on('click',function(){
        // window.location.href='pie.html';
         
      secondStep(parseInt(arg1),parseInt(arg2),parseInt(arg3));
      });

  state.selectAll("rect")
      .data(function(d) { return d.ages; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color(d.name); })
      
   
        .on("mouseover",function(d,i){
            d3.select(this)
                .style("fill","yellow");
        })
        .on("mouseout",function(d,i){
            d3.select(this)
                .transition()
                .duration(500)
                .style("fill",color(d.name));
        })
        ;

  var legend = svg.selectAll(".legend")
      .data(ageNames.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});


function secondStep( arg1, arg2, arg3){
console.log(arg1+"~~~"+arg2+"~~~"+arg3);

var pie = new d3pie("pieChart", {
	"header": {
		"title": {
			"text": "STATE "+find_state,
			"fontSize": 24,
			"font": "open sans"
		},
		"subtitle": {
			"text": "the fatal count",
			"color": "#999999",
			"fontSize": 12,
			"font": "open sans"
		},
		"titleSubtitlePadding": 9
	},
	"footer": {
		"color": "#999999",
		"fontSize": 10,
		"font": "open sans",
		"location": "bottom-left"
	},
	"size": {
		"canvasWidth": 590,
		"pieOuterRadius": "90%"
	},
	"data": {
		"sortOrder": "value-desc",
		"content": [
			{
				"label": "FATAL_COUNT=1",
				"value": arg1,
				"color": "#2484c1"
			},
			{
				"label": "FATAL_COUNT=2",
				"value": arg2,
				"color": "#0c6197"
			},
			{
				"label": "FATAL_COUNT>2",
				"value": arg3,
				"color": "#4daa4b"
			}
			
		]
	},
	"labels": {
		"outer": {
			"pieDistance": 32
		},
		"inner": {
			"hideWhenLessThanPercentage": 0
		},
		"mainLabel": {
			"fontSize": 11
		},
		"percentage": {
			"color": "#ffffff",
			"decimalPlaces": 0
		},
		"value": {
			"color": "#adadad",
			"fontSize": 11
		},
		"lines": {
			"enabled": true
		},
		"truncation": {
			"enabled": true
		}
	},
	"effects": {
		"pullOutSegmentOnClick": {
			"effect": "linear",
			"speed": 400,
			"size": 8
		}
	},
	"misc": {
		"gradient": {
			"enabled": true,
			"percentage": 100
		}
	}
});


}