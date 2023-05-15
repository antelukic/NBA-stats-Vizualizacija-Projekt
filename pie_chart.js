async function getPlayers() {
  var data = await fetch("./data/players.json")
    .then((response) => response.json())
    .then((d) => d);

  return data.filter((player) => {
    if (player.birth_state == "") return false;
    return true;
  });
}

async function getYears() {
  const data = await getPlayers();

  var groupedYears = data.reduce((item, year) => {
    const { season } = year;
    item[season] = item[season] ?? [];
    item[season].push(year);
    return item;
  });
  return [...new Set(groupedYears.undefined.map((r) => r.born))];
}

async function getChartData(data) {
  var groupedItems = data.reduce((item, state) => {
    const { playerState } = state;
    item[playerState] = item[playerState] ?? [];
    item[playerState].push(state);
    return item;
  }, {});
  groupedItems = [...new Set(groupedItems.undefined.map((r) => r.birth_state))];

  const chartData = [];
  groupedItems.forEach((item) => {
    chartData.push({
      state: item,
      playersCount: data.filter((player) => player.birth_state === item).length,
    });
  });

  return chartData;
}

async function playersPerStatePieChart() {
  const data = await getPlayers();
  const years = await getYears();
  var chartData = await getChartData(data);

  chartData = await getChartData(data.filter((player) => player.born == 1927));

  var width = 750;
  var height = 750;

  d3.select("body")
    .append("div")
    .attr("id", "name")
    .append("p")
    .attr("id", "state");

  var dropDown = d3
    .select("body")
    .append("p")
    .text("Odaberite godinu rođenja igrača");

  dropDown
    .append("select")
    .selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", (d) => {
      return d;
    })
    .text((d) => {
      return d;
    });

  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    console.log(chartData)

  fillPieChart(svg, chartData);

  dropDown.on("change", async function () {
    var selectedYear = d3.select(this).select("select").property("value");

    const newData = data.filter((player) => player.born == selectedYear);
    const newChartData = await getChartData(newData);

    fillPieChart(svg, newChartData);
  });
}

function fillPieChart(svg, data) {
  var width = 750;
  var height = 650;
  var outerRadius = 300;
  var innerRadius = 200;

  var color = d3.scale.category20();

  var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

  var pie = d3.layout.pie().value(function (d) {
    return d.playersCount;
  });

  var pieArcs = svg.selectAll("g.pie").data(pie(data));

  pieArcs
    .enter()
    .append("g")
    .attr("class", "pie")
    .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");

  pieArcs
    .append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", arc);

  pieArcs.exit().remove();

  pieArcs.on("mouseover", function (d) {
    d3.select("#state").text(
      `${d.data.state}, broj igrača: ${d.data.playersCount}`
    );
  });
}
