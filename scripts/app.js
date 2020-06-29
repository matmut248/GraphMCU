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

    brush.extent([[0,0],[width-120,height-80-height*0.65]])
        .on("brush",function(){
            var init = d3.event.selection[0]
            var last = d3.event.selection[1]
            updateFocusX(init+100,last+100);

        })
        .on("end",function(){
            if(!d3.event.selection)
                d3.select(".brush").call(brush.move,defaultSelection)
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
    console.log(lastValue)
    if(lastValue == 0 && lastValue != initValue){
        lastValue = mlist.length
    }
    console.log(lastValue, mlist.slice(initValue, lastValue+1))
    var newDomain = mlist.slice(initValue, lastValue+1);
    if(newDomain[newDomain.length-1] != "Spider-Man: Far From Home"){
        newDomain.pop()
    }
    x_focus.domain(newDomain);
    createFilmArea();
    tickFocusResize();

    d3.select(".x.focus").transition().duration(updateTime)
        .call(xAxis_focus)

    focus.select(".y.focus").selectAll(".tick text").on("click",function(){ popOutMenu()})
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

    console.log(hlist)
}

// funzione che disegna gli eventi nel context
function drawEventContext(data){
    elist = data;
    var event = focus.selectAll(".event context").data(data,function(d){
        if(x_focus.domain().indexOf(d.film) != -1)
            return d;
    });

    event.exit().remove();
    event.enter().append("circle")
        .attr("class","event context")
        .attr("cx", function(d){ return x_focus(d.film) })
        .attr("cy", y_focus("eroe2"))
        .attr("r","5")
        .attr("fill","blue")
    event.transition().duration(updateTime)
        .attr("cx", function(d){ return x_focus(d.film) })
        .attr("cy", y_focus("eroe2"))
        .attr("r","5")
        .attr("fill","blue")
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
            .attr("stroke","black")
        focus.append("line").attr("class","area-line-dashed")
            .attr("x1",110+d*(i+1))
            .attr("y1",466.2)
            .attr("x2",110+d*(i+1))
            .attr("y2",8)
            .attr("stroke","white")
    }
    
}

function drawIcon(){
    if(y_focus.domain().length < 7){
        var ticks = focus.select(".y.focus").selectAll(".tick text").style("display","none")
        console.log(parent)
        for (var i = 0; i < ticks["_groups"][0].length; i++){
            var hero = ticks["_groups"][0][i].textContent
            var img = heroToIcon[hero];
            ticks["_groups"][0][i].append("image")
                .attr("xlink:href","../hero_icon/"+img+".svg")
                .attr("width", "20")
                .attr("height", "20");
        }
        //console.log(ticks["_groups"][0][2].textContent)
    }
}

function popOutMenu(){
    infoBox = d3.select(".info-box")
             .transition()
             .duration(1000)
             .style("transform","translate(0,0)")
}

d3.json("../data/marvel-graph.JSON")
    .then(function(data){
        loadDAta(data);
        createFocus();
        createBrush();
        createFilmArea();

        //drawIcon();

    })
    .catch(function(error) {
		console.log(error); // Some error handling here
    });

d3.json("../data/MCU-heroToIcon.json")
    .then(function(data){
        heroToIcon = data;
    })
    .catch(function(error) {
        console.log(error); // Some error handling here
    });

d3.json("../data/MCU-events-dataset.json")
    .then(function(data){
        //drawEventContext(data);
    })
    .catch(function(error) {
		console.log(error); // Some error handling here
    });