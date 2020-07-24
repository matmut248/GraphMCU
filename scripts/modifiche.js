/*FILTER PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGE*/
var firstSelectionHero = true
var firstSelectionMovie = true
var filterPagePosition = window.innerWidth - 550

/*DA AGGIUNGERE IL BORDO*/
var filterPageHero = d3.select("body").append("div")
    .attr("class","filter-box-hero")
    .style("transform","translate("+filterPagePosition+"px, 200px)")
    .style("border-color","blue")
    .style("border-width",3)
    .style("overflow-x","hidden")
    .style("overflow-y","scroll")
    .style("width",260)
    .style("height",300)
var filterPageMovie = d3.select("body").append("div")
    .attr("class","filter-box-movie")
    .style("transform","translate("+(filterPagePosition-260)+"px, 600px)")
    .style("border-color","blue")
    .style("border-width",3)
    .style("overflow-x","hidden")
    .style("overflow-y","scroll")
    .style("width",260)
    .style("height",300)


function createFilterPage(){

    var filterPageSelectionHeroList = d3.select(".filter-box-hero")
                                    .append("h3")
                                    .text("Seleziona l'eroe")
                                    .append("ul")

    var filterPageSelectionMovieList = d3.select(".filter-box-movie")
                                    .append("h3")
                                    .text("Seleziona il film")
                                    .append("ul")
   
    hlist.forEach(function(hero){
        elem = filterPageSelectionHeroList.append("li")
        id = hero + "_hero_checkbox"
        elem.append("input")
        .attr("id",id)
        .attr("class", "checkbox")
        .attr("type","checkbox")
        .attr("value",hero)
        .on("change", function(){
            /*Quando clicchi la prima volta pulisce il dominio precedente e lascia solo quello che desideri*/
            if(this.checked){
                /*Se è la prima volta che lo clicchi*/
                if(firstSelectionHero){
                    y_focus.domain([])
                    firstSelectionHero= false
                }
                 temp = y_focus.domain()
                 temp.push(this.value)
                 temp = sortArrayAsAnother(temp,hlist)
                 y_focus.domain(temp)

                 d3.select(".y.focus")
                   .transition()
                   .duration(updateTime)
                   .call(yAxis_focus)

                drawIcon(y_focus.domain())
                updateEventFocusWithFilter()
                }
            else{
                val = String(this.value)
                temp = y_focus.domain()
                temp = temp.filter(function(hero){
                    return !(hero == val)
                })

                if(temp.length == 0){
                    firstSelectionHero = true
                    /*DA GESTIRE IL CASO IN CUI SVUOTO IL FILTRO*/
                }

                y_focus.domain(temp)
                d3.select(".y.focus")
                   .transition()
                   .duration(updateTime)
                   .call(yAxis_focus)
                drawIcon(y_focus.domain())
                updateEventFocusWithFilter()

             }
              })

        elem.append("label")
              .attr("for",id)
              .text(hero)
              
    })

    mlist.forEach(function(movie){
        elem = filterPageSelectionMovieList.append("li")
        id = movie+"_movie_checkbox"
        elem.append("input")
        .attr("id",id)
        .attr("class", "checkbox")
        .attr("type","checkbox")
        .attr("value",movie)
        .on("change", function(){
            if(this.checked){
                if(firstSelectionMovie){
                    x_focus.domain([])
                    firstSelectionMovie = false
                }

                 temp = x_focus.domain()
                 temp.push(this.value)
                 temp = sortArrayAsAnother(temp,mlist)
                 x_focus.domain(temp)
                 d3.select(".x.focus")
                   .transition()
                   .duration(updateTime)
                   .call(xAxis_focus)

                 updateEventFocusWithFilter()
                 tickFocusResize();

                 }
            else{
                val = String(this.value)
                temp = x_focus.domain()
                temp = temp.filter(function(movie){
                    return !(movie == val)
                })
                if(temp.length == 0){
                    firstSelectionMovie = true
                    /*DA GESTIRE IL CASO IN CUI SVUOTO IL FILTRO*/
                }
                x_focus.domain(temp)

                 d3.select(".x.focus")
                   .transition()
                   .duration(updateTime)
                   .call(xAxis_focus)

                updateEventFocusWithFilter()
                tickFocusResize();

                 }
            })  

        elem.append("label")
              .attr("for",id)
              .text(movie)
              
    })
}

function sortArrayAsAnother(list,ordered){
    tmp = []
    list.forEach(function(elem){
        index = ordered.indexOf(elem)
        tmp.push({"x" : elem, "y" : index })
    })

    tmp.sort(function(elem1,elem2){
        return elem1.y - elem2.y
    })
    
    newArray = []
    tmp.forEach(function(elem){
        newArray.push(elem.x)  
    })

    return newArray
}
function updateEventFocusWithFilter(){
    
    d3.selectAll(".focus.event").transition().duration(updateTime/2).style("opacity","0")
    d3.selectAll(".focus.event").remove()
    var b = x_focus.bandwidth()
    for(var i in x_focus.domain()){
        var film = x_focus.domain()[i];
        if(elist[film] != undefined){
            var e = elist[film]["events"];
            var delta = b/e.length;
            for(var j in e){
                var hero = e[j][1]
                if(y_focus.domain().includes(hero)){
                focus.append("circle")
                    .attr("class","focus event")
                    .attr('cx', x_focus(film)+delta*j + 130)
                    .attr('cy', y_focus(hero))
                    .attr('r', 10)
                    .attr('fill', function(d) {return heroToColor[hero]})
                    .attr("eventDetail",e[j][0])
                    .style("opacity","0")
                    .on("mouseover",function(d){
                        var x = d3.event.srcElement.getAttribute("cx");
                        var y = d3.event.srcElement.getAttribute("cy");
                        var e = d3.event.srcElement.getAttribute("eventDetail");
                        console.log(e)
                        //popUpEvent(x,y,e);
                    });
                }
                    
            }
        }
    }
    d3.selectAll(".focus.event").transition().duration(updateTime).style("opacity","1");
}
/*FILTER PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGE end*/

/*DA AGGIUNGERE SU ON BRUSH*/
d3.selectAll(".checkbox").property("checked", false)
            firstSelectionMovie = true
            firstSelectionHero = true


/*da  mettere su end del brush*/
.on("end",function(){
            if(!d3.event.selection)
                d3.select(".brush").call(brush.move,defaultSelection)
            else{
                var selection = d3.event.selection;
                var init = d3.event.selection[0]
                var last = d3.event.selection[1]  
                if(numberoFilmInBrush(init, last) > 8){
                    d3.select(".brush").transition().delay(100).duration(500).call(brush.move,defaultSelection)
                    d3.selectAll(".checkbox").property("checked", false)
                    firstSelectionMovie = true
                    firstSelectionHero = true
                }
            }
        })


function numberoFilmInBrush(init, last){
    var initValue = 0, lastValue = 0;
    var deltaX = x.bandwidth()/2;

    for(var i=0; i < mlist.length; i++){
        var s = mlist[i];
        if( ((x(s)-deltaX) <= init) && ( init <= (x(s)+deltaX)) ){
            initValue = i;
        }
        if( ((x(s)-deltaX) <= last) && ( last <= (x(s)+deltaX)) ){
            lastValue = i;
        }
        
    }
    if(lastValue == 0 && lastValue != initValue){
        lastValue = mlist.length
    }
    var newDomain = mlist.slice(initValue, lastValue+1);
    if(newDomain[newDomain.length-1] != "Spider-Man: Far From Home"){
        newDomain.pop()
    }
    return newDomain.length+2
}


/*Da cambiare popout menu*/
function popOutMenu(value,type){

    if(isVisible){
        infoBox.selectAll("div").transition().duration(500).style("opacity","0").remove()
    }
    if(type == "hero"){
        var img = heroToIcon[value];
        var descr = "Iron Man è il migliore di tutti e salverà il mondo dai pagliacci come simone"//heroDescr[hero];

        infoBox.style("border-color",heroToColor[value])
        infoBox.append("div").transition().delay(500)
            .attr("class","name")
            .style("margin-left",25)
            .text(value);
        infoBox.append("div").append("img").transition().delay(500)
            .attr("class","poster")
            .attr("src","../hero_icon/"+img);
        infoBox.append("div").transition().delay(500)
            .attr("class","description")
            .text(descr);
        isVisible = true;
    }
    if(type == "film"){
        var obj = {};
        for(var i in filmData){
            if(filmData[i]["film"] == value)
                obj = filmData[i];
        }

        infoBox.append("div").transition().delay(500).attr("class","name").text(value);

        infoBox.append("div").append("img").transition().delay(500)
            .style("padding-top","10px")
            .attr("width",200)
            .attr("src","../movie_poster/"+obj["movie_poster"]);

        infoBox.append("div").transition().delay(550)
            .style("padding-top","10px")
            .attr("font-size","12px")
            .text(obj["description"]);

        infoBox.append("div").transition().delay(550)
            .style("padding-top","10px")
            .attr("font-size","12px")
            .text("Data di uscita : "+ obj["released"]);

        infoBox.append("div").transition().delay(550)
            .style("padding-top","10px")
            .attr("font-size","12px")
            .text("Regista : "+ obj["director"]);

        infoBox.append("div").transition().delay(550)
            .style("padding-top","10px")
            .attr("font-size","12px")
            .text("Budget : "+ obj["budget"]);

        infoBox.append("div").transition().delay(550)
            .style("padding-top","10px")
            .attr("font-size","12px")
            .text("Box Office : "+ obj["box_office"]);

        infoBox.append("div").transition().delay(550)
            .style("padding-top","10px")
            .attr("font-size","12px")
            .text("Post Credit : "+ obj["post_credit"]);
        
        /**infoBox.append("div")
            .append("iframe")
            .attr("width",260)
            .attr("height",200)
            .attr("src",obj["link_post_credit"])*/

        isVisible = true;
    }
    
    infoBox.transition().duration(updateTime)
           .style("transform","translate("+width+"px,0px)")
}