//creazione del grafico superiore
function createFocus(){
    focus.append("g")
        .attr("class","x focus")
        .attr("transform","translate(110,"+ (height*0.65-20) +")")
        .call(xAxis_focus)

    focus.append("g")
        .attr("class","y focus")
        .attr("transform","translate(110,0)")
        .call(yAxis_focus)
    focus.select(".y.focus").selectAll(".tick text")
        .attr("transform","translate(-8,0)")
        .call(wrap,40)

}

//creazione del grafico inferiore
function createBrush(){
    
    var defaultSelection = [0,x.bandwidth()*3];

    brush.extent([[0,-5],[width-120,height-80-height*0.65]])
        .on("brush",function(){
            var init = d3.event.selection[0]
            var last = d3.event.selection[1]
            var newdomX = updateFocusX(init+100,last+100);
            var newdomY = updateFocusY(newdomX);
            drawIcon(newdomY);
            if(JSON.stringify(newdomX) != JSON.stringify(current_domain)){
                updateEventFocus();
                current_domain = newdomX;
            }
        })
        .on("end",function(){
            if(!d3.event.selection)
                d3.select(".brush").call(brush.move,defaultSelection).call(tickFocusResize())
        })
        
    context.append("g")
        .attr("class","x axis")
        .attr("transform","translate(10,"+ (height-60) +")")
        .call(xAxis)
    context.select(".x.axis").selectAll(".tick text")
        .attr("transform","translate(-20,25)rotate(-70)")
        .call(wrap,56);
    context.append("g")
        .attr("class","y axis")
        .attr("transform","translate(110,20)")
        .call(yAxis)
    context.append("g")
        .attr("class","brush")
        .attr("transform","translate("+ margin.innerLeft +","+ (height*0.7-18) +")")
        .call(brush)
        .call(brush.move, defaultSelection);
}

//funzione che modifica l'asse x del focus quando viene spostato il brush
function updateFocusX(init,last){

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
    x_focus.domain(newDomain);
    createFilmArea();

    d3.select(".x.focus").transition().duration(updateTime)
        .call(xAxis_focus)
    tickFocusResize();

    focus.selectAll(".x .tick text").on("click",function(){popOutMenu(this.innerHTML,"film")})

    return x_focus.domain()
    
}

function updateFocusY(newdom){
    var h = [];
    for (var i in newdom){
        var mv = newdom[i];
        if(elist[mv] != undefined){
           for (var j in elist[mv].heroes)
                h.push(elist[mv].heroes[j])
        }
    }
    y_focus.domain(h)
    d3.select(".y.focus").transition().duration(updateTime)
        .call(yAxis_focus)

    return  y_focus.domain()
}

//salvataggio lista dei film e degli eroi, set del dominio di x e y
function loadDAta(data) { 
    var i = 0;
    var valuesM = data[0]["movies"];
    var valuesH = data[0]["heroes"];

    while(i < valuesM.length){
        mlist.push(valuesM[i].name)
        i = i + 1;
    }
    i = 0;
    while(i < valuesH.length){
        hlist.push(valuesH[i].name)
        i = i + 1;
    }

    x.domain(mlist);
    y.domain(hlist);

}

// funzione che disegna gli eventi nel context
function drawEventContext(){
    var b = x.bandwidth()
    /*context.append("circle").attr("class","context event")
        .attr('cx', x("Thor"))
        .attr('cy', y("Thor"))
        .attr('r', 6)
        .attr('fill', function(d) {return heroToColor["Thor"]})*/
   for (var i in mlist){
        var film = mlist[i]
        if(elist[film] != undefined){
            var e = elist[film]["events"];
            var delta = b/e.length;
            for(var j in e){
                var hero = e[j][1]
                context.append("circle")
                    .attr("class","context event")
                    .attr('cx', x(film)+delta*j+15)
                    .attr('cy', y(hero)+20)
                    .attr('r', 3)
                    .attr('fill', function(d) {return heroToColor[hero]});
            }
        }
    }
}

// funzione che disegna le linee che dividono i film nel focus
function createFilmArea(){
    var d = x_focus.bandwidth();
    var n = x_focus.domain().length;
    focus.selectAll(".area-line").remove()
    focus.selectAll(".area-line-dashed").remove()
    for(var i = 0; i < n-1; i++){
        focus.append("line").attr("class","area-line")
            .attr("x1",110+d*(i+1))
            .attr("y1",466.2)
            .attr("x2",110+d*(i+1))
            .attr("y2",8)
            .attr("stroke-width","0.1px")
            .attr("stroke","black")
        focus.append("line").attr("class","area-line-dashed")
            .attr("x1",110+d*(i+1))
            .attr("y1",466.2)
            .attr("x2",110+d*(i+1))
            .attr("y2",8)
            .attr("stroke","white")
    }
    
}

function drawIcon(newdom){
    if(newdom.length <= 7){
        
        var icon = focus.selectAll(".img.icon").data(newdom)
        var crown = focus.selectAll(".crown.icon").data(newdom)

        icon.exit().remove();
        icon.enter().append("image").attr("class","img icon")
            .attr('x', 20)
            .attr('width', 48)
            .attr('height', 48)
            .attr("xlink:href", function(d){return "../hero_icon/"+heroToIcon[d]});
        icon.transition().duration(updateTime/2)
            .attr('x', 20)
            .attr('width', 48)
            .attr('height', 48)
            .attr("xlink:href", function(d){return "../hero_icon/"+heroToIcon[d]});

        crown.exit().remove();
        crown.enter().append("circle").attr("class","crown icon").attr("id",function(d){return d})
            .attr('cx', 44)
            .attr('r', 24)
            .attr('stroke', function(d) {return heroToColor[d]})
            .attr("stroke-width", "2px")
            .attr("fill", "red")
            .attr("fill-opacity", "0.0");
        crown.attr('cx', 44)
            .attr('r', 24)
            .attr('stroke', function(d) {return heroToColor[d]})
            .attr("stroke-width", "2px")
            .attr("fill", "red")
            .attr("fill-opacity", "0.0");
        
        var yL = y_focus.range()[0];
        var deltaL = (yL-y_focus.range()[1]) / (newdom.length - 1);
        for (var h in newdom){
            var node = focus.selectAll(".img.icon")["_groups"][0][h]
            node.setAttribute("y",yL - (deltaL*h) - 48)
        }
        for (var h in newdom){
            var node = focus.selectAll(".crown.icon")["_groups"][0][h]
            node.setAttribute("cy",yL - (deltaL*h) - 24)
        }
        focus.selectAll(".icon").style("transform","translate(25px,24px)")
        focus.select(".y.focus").selectAll(".tick text").style("display","none")
        focus.selectAll(".icon").on("click",function(){ popOutMenu(this.id,"hero")});
    }
}

function popOutMenu(value,type){

    if(type == "hero"){
        var img = heroToIcon[value];
        var descr = "Iron Man è il migliore di tutti e salverà il mondo dai pagliacci come simone"//heroDescr[hero];

        infoBox.style("border-color",heroToColor[value])
        infoBox.append("div").attr("class","name").text(value);
        infoBox.append("img").attr("class","poster").attr("src","../hero_icon/"+img);
        infoBox.append("div").attr("class","description").text(descr);
    }
    if(type == "film"){
        var obj = {};
        for(var i in filmData){
            if(filmData[i]["film"] == value)
                obj = filmData[i];
        }

        infoBox.append("div").attr("class","name").text(value);
        infoBox.append("img")
            .attr("width",200)
            .attr("src","../movie_poster/"+obj["movie_poster"]);
        infoBox.append("div")
            .attr("font-size","12px")
            .text(obj["description"]);
    }
    
    infoBox.transition().duration(1000)
           .style("transform","translate(0,0)")
}

function updateEventFocus(){
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
                context.append("circle")
                    .attr("class","focus event")
                    .attr('cx', x_focus(film)+delta*j + 130)
                    .attr('cy', y_focus(hero))
                    .attr('r', 10)
                    .attr('fill', function(d) {return heroToColor[hero]})
                    .style("opacity","0");
            }
        }
    }
    d3.selectAll(".focus.event").transition().duration(updateTime/2).style("opacity","1")
}

d3.json("../data/MCU-heroToIcon.json")
    .then(function(data){
        heroToIcon = data;
    })
    .catch(function(error) {
        console.log(error); // Some error handling here
    });
d3.json("../data/MCU-heroToColor.json")
    .then(function(data){
        heroToColor = data;
    })
    .catch(function(error) {
        console.log(error); // Some error handling here
    });
d3.json("../data/MCU-film-description.JSON")
    .then(function(data){
        filmData = data;
    })
    .catch(function(error) {
        console.log(error); // Some error handling here
    });
d3.json("../data/MCU-events-dataset.json")
    .then(function(data){
        elist = data;
    })
    .catch(function(error) {
		console.log(error); // Some error handling here
    });

d3.json("../data/marvel-graph.JSON")
    .then(function(data){
        loadDAta(data);
        createFocus();
        createBrush();
        createFilmArea();
        drawEventContext();
        updateEventFocus();
        
        

    })
    .catch(function(error) {
		console.log(error); // Some error handling here
    });
