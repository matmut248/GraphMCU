/**
 * FILE CHE CONTIENE LE VARIABILI GLOBALI
 */

//grandezze svg
var margin = {top : 0, bottom : 15, left : 0, right : 300, innerLeft : 110}
var width = window.innerWidth - margin.right;
var height = window.innerHeight - margin.bottom;

//lista film, eroi, eventi
var mlist = [];
var hlist = [];
var elist = {};
var heroToIcon = {};
var heroToColor = {};
var filmData = [];
var heroData = {};

//durata animazioni
var updateTime = 700;

//assi e scale del context e del focus
var x = d3.scaleBand().range([100,width-20])
var y = d3.scalePoint().range([height-80,height*0.65])
var x_focus = d3.scaleBand().range([0,window.innerWidth-180])
var y_focus = d3.scalePoint().range([height*0.65-40,30])
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);
var xAxis_focus = d3.axisBottom(x_focus);
var yAxis_focus = d3.axisLeft(y_focus);

var current_domain = [];

//container
var svg = d3.select(".top").append("svg")
    .style("float","left")
    .attr("height",height*0.66)
    .attr("width",window.innerWidth);
var svgBottom = d3.select(".bottom svg")
    .style("float","left")
    .attr("height",height*0.34)
    .attr("width",width);

//container dei due grafici
var focus = svg.append("g").attr("class","focus").attr("viewbox",[0,0,window.innerWidth,height*0.65])
var context = svgBottom.append("g").attr("class","context").attr("viewbox",[0,0,width,height]).style("transform","translate(-100px,0px)")

//area di selezione sul context
var brush = d3.brushX()
var brushPos = [];

//infobox dei film e degli eroi
var infoBox = d3.select("body").append("div")
    .attr("class","info-box")
    .style("transform","translate(20px, 0px)")

infoBox.append("img")
    .style("float","left")
    .attr('width', 24)
    .attr('height', 24)
    .attr("src", "../hero_icon/close.png")
    .on("click",function(){
        infoBox.transition().duration(updateTime).style("transform","translate(20px, 0px)")
    })

var isVisible = false;

var xL = x_focus.range()[1]-x_focus.range()[0]
var yL = y_focus.range()[0]-y_focus.range()[1]
var dimBaloon = {width : xL/3 , height : yL * 0.6, margin : 5}


d3.select(".filter")
    .style("width",window.innerWidth-width+100)
    .style("height",height*0.34)
    .style("display","flex")
    .style("float","left")


var firstSelectionHero = true
var firstSelectionMovie = true
var filterPagePosition = window.innerWidth - 550

var filterPageHero = d3.select(".filter").append("div")
    .attr("class","filter-box-hero")
var filterPageMovie = d3.select(".filter").append("div")
    .attr("class","filter-box-movie")
