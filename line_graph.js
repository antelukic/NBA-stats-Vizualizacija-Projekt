async function PointsLineGraph() {
  var data = await fetch("./data/season_stats.json")
    .then((response) => response.json())
    .then((d) => d);

  data = data.filter((stat) => {
    if (stat.Year == "") return false;
    if (stat.PTS == "") return false;
    return true;
  });

  var xAxisData = data.reduce((year, stat) => {
    const { statYear } = stat;
    year[statYear] = year[statYear] ?? [];
    year[statYear].push(stat);
    return year;
  }, {});
  xAxisData = [...new Set(xAxisData.undefined.map((y) => y.Year))];

  const yAxisData = [];
  xAxisData.forEach((year) => {
    var sumByYear = 0;
    data.forEach((stat) => {
      if (stat.Year === year) {
        sumByYear = sumByYear += stat.PTS;
      }
    });
    yAxisData.push(sumByYear);
    sumByYear = 0;
  });

  var graphData = [];
  xAxisData.forEach((year, i) => {
    graphData.push({
      year: year,
      points: yAxisData[i],
    });
  });

  var margin = { top: 50, bottom: 70, left: 80, right: 20 };
  var width = 750 - margin.left - margin.right;
  var height = 750 - margin.top - margin.bottom;

  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 20)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scale
    .linear()
    .domain([xAxisData[0], xAxisData[xAxisData.length - 1]])
    .range([0, width]);

  var y = d3.scale
    .linear()
    .domain([
      0,
      d3.max(yAxisData, function (d) {
        return d;
      }),
    ])
    .range([height, 0]);

  var xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom")
    .ticks(20)
    .tickFormat(d3.format("d"));
  var yAxis = d3.svg
    .axis()
    .scale(y)
    .orient("left")
    .ticks(30)
    .tickFormat(d3.format("d"));

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -(margin.top / 2))
    .attr("font-weight", "bold")
    .style("font-size", "20px")
    .style("text-anchor", "middle")
    .text("Broj poena po godini u NBA ligi");

  svg.append("g").attr("class", "y axis").call(yAxis);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -(margin.left / 2 + 30))
    .style("text-anchor", "middle")
    .text("Poeni")
    .style("font-size", "13px");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Godina");

  var valueline = d3.svg
    .line()
    .interpolate("cardinal")
    .x(function (d) {
      return x(d.year);
    })
    .y(function (d) {
      return y(d.points);
    });

  var linechart = svg
    .append("path")
    .attr("class", "line")
    .attr("d", valueline(graphData))
    .style("stroke", "blue")
    .attr("fill", "none")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  const length = linechart.node().getTotalLength(); // Get line length
  linechart
    .attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .attr("stroke-dashoffset", 0)
    .delay(500)
    .duration(3000);

    var vertical = d3.select("body")
      .append("div")
      .attr("class", "remove")
      .style("position", "absolute")
      .style("z-index", "19")
      .style("width", "1px")
      .style("height", "380px")
      .style("top", "10px")
      .style("bottom", "30px")
      .style("left", "0px")
      .style("background", "#fff");

    d3.select(".body")
    .on("mousemove", function(){  
       let mousex = d3.mouse(this);
       mousex = mousex[0] + 5;
       vertical.style("left", mousex + "px" )})
    .on("mouseover", function(){  
       mousex = d3.mouse(this);
       mousex = mousex[0] + 5;
       vertical.style("left", mousex + "px")});

  svg
    .selectAll("g")
    .attr("fill", "none")
    .attr("stroke", "navy")
    .attr("stroke-width", 1.3);
}
