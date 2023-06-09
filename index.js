const width = 1000;
const height = 650;
const padding = 10;

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("display", "flex")
  .style("padding", padding)
  .style("margin", "20 auto")
  .style("font-family", "Helvetica");

const path = d3.geoPath();
const g = svg.append("g");

Promise.all([
  d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  ),
  d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  ),
]).then(async ([education, topology]) => {
  const threshold = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeBlues[8]);

  const x = d3.scaleLinear().domain([2.6, 75.1]).range([600, 860]);

  const colorRect = threshold.range().map((color) => {
    const d = threshold.invertExtent(color);
    if (d[0] == null) d[0] = x.domain()[0];
    if (d[1] == null) d[1] = x.domain()[1];
    return d;
  });

  const filteredData = (ed, d) =>
    ed.filter((object) => {
      return object.fips === d.id;
    });

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .attr("id", "tooltip")
    .style("visibility", "hidden")
    .style("background", "#5958E0")
    .style("padding", "10px")
    .style("opacity", 1)
    .style("color", "white")
    .style("border-radius", "5px")
    .style("opacity", "0.8")
    .style("box-shadow", "1px 1px 10px #80808099");

  g.selectAll("path")
    .data(topojson.feature(topology, topology.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => {
      return filteredData(education, d)[0]
        ? filteredData(education, d)[0].bachelorsOrHigher
        : 0;
    })
    .style("stroke", "white")
    .style("stroke-width", "0.2")
    .attr("fill", (d) => {
      return filteredData(education, d)[0]
        ? threshold(filteredData(education, d)[0].bachelorsOrHigher)
        : threshold(0);
    })
    .on("mouseover", () => {
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", (d, i) => {
      tooltip
        .attr("data-fips", i.id)
        .attr("data-education", (d) => {
          return filteredData(education, i)[0]
            ? filteredData(education, i)[0].bachelorsOrHigher
            : 0;
        })
        .style("left", d.pageX + 10 + "px")
        .style("top", d.pageY + 20 + "px");

      d3.selectAll("#tooltip")
        .html(
          `${filteredData(education, i)[0].area_name},  ${
            filteredData(education, i)[0].state
          }: ${filteredData(education, i)[0].bachelorsOrHigher}% `
        )
        .style("font-size", "0.8rem")
        .style("font-family", "Helvetica");

      return tooltip.style("visibility", "visible");
    })
    .on("mouseout", (d, i) => {
      return tooltip.style("visibility", "hidden");
    });

  /* *****************************Legends***************************** */

  svg.append("g").attr("id", "legend").attr("transform", "translate(0,40)");

  const formatNumber = d3.format(".0f");

  const xAxisLegend = d3
    .axisBottom()
    .scale(x)
    .tickSize(15)
    .tickValues(threshold.domain())
    .tickFormat((d) => `${Math.round(formatNumber(d))}%`);

  const l = d3.select("#legend").call(xAxisLegend);

  l.select(".domain").remove();

  l.selectAll("rect")
    .data(colorRect)
    .enter()
    .insert("rect", ".tick")
    .attr("height", 8)
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("fill", (d) => threshold(d[0]));

  l.append("text")
    .attr("transform", "translate(600,-10)")
    .attr("fill", "#000")
    .attr("font-weight", "300")
    .attr("text-anchor", "start")
    .attr("font-size", "11")
    .text("Legend percentage");
});
