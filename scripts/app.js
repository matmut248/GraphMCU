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

    brush.extent([[0,-10],[width-120,height-80-height*0.65]])
        .on("brush",function(){
            var selection = d3.event.selection;
            var init = d3.event.selection[0]
            var last = d3.event.selection[1]
            brushPos = [init,last]         
            var newdomX = updateFocusX(init+100,last+100);
            var newdomY = updateFocusY(newdomX);
            drawIcon(newdomY);
            if(JSON.stringify(newdomX) != JSON.stringify(current_domain)){
                createFilmArea();
                updateEventFocus();
                current_domain = newdomX;
            }
            d3.selectAll(".checkbox").property("checked", false)
            firstSelectionMovie = true
            firstSelectionHero = true

        })
        .on("end",function(){
             if(!d3.event.selection){
                d3.selectAll(".checkbox").property("checked", false)
                firstSelectionMovie = true
                firstSelectionHero = true
                d3.select(".brush").call(brush.move,defaultSelection)
                updateEventFocus()
            }else{
                var init = d3.event.selection[0]
                var last = d3.event.selection[1] 
                brushPos = resizeBrush(init, last)

            }
            createFilmArea()
            d3.select(".checkbox.AND").attr("disabled",true)
        })
    context.append("g")
        .attr("class","x axis")
        .attr("transform","translate(10,"+ (height*0.26) +")")
        .call(xAxis)
    context.select(".x.axis").selectAll(".tick text")
        .attr("transform","translate(-20,25)rotate(-70)")
        .call(wrap,56);
    context.append("g")
        .attr("class","y axis")
        .attr("transform","translate(110,-482)")
        .call(yAxis)
    context.append("g")
        .attr("class","brush")
        .attr("transform","translate("+ margin.innerLeft +",10)")
        .call(brush)
        .call(brush.move, defaultSelection);
}

//RESIZE BRUSH CORRETTO
function resizeBrush(){
    var init = d3.event.selection[0]
    var last = d3.event.selection[1]
    var b = x.bandwidth()
    var newinit = 0, newlast = 0;
    /*if (!d3.event.sourceEvent || !d3.event.selection) return;*/
    for(var j in mlist){
        i = parseInt(j)
        if(init >= b*i && init <= b*(i+1)){
            if( (init-b*i) <= (b*(i+1)-init) || init==0) {
                newinit = b*i
                break
            }
            else {
                newinit = b*(i+1)
                break
            }
        }
    }

    for(var i in mlist){
        j = parseInt(i)
        if(last >= b*j && last <= b*(j+1)){
            if( (last-b*j) <= (b*(j+1)-last) ) {
                newlast = b*j
                break
            }
            else {                
                newlast = b*(j+1)
                break
            }
        }
    }
    if(init != newinit || last != newlast){
        d3.select(".brush").transition().duration(200).call(brush.move,[newinit,newlast])
    }

    return[newinit, newlast]
    
}


//funzione che modifica l'asse x del focus quando viene spostato il brush
function updateFocusX(init,last){

    var initValue = 0, lastValue = 0;
    var deltaX = x.bandwidth()/2;
    var newdom = [];

    for(var i=0; i < mlist.length; i++){
        var s = mlist[i];
        if(x(s)+deltaX>=init && x(s)+deltaX<=last){
            newdom.push(s);
        }
    }
    
    x_focus.domain(newdom);

    d3.select(".x.focus").transition().duration(updateTime).call(xAxis_focus)

    tickFocusResize();

    focus.selectAll(".x .tick text").on("mouseover",function(){d3.select(this).style("text-decoration","underline")})
    focus.selectAll(".x .tick text").on("mouseout",function(){d3.select(this).style("text-decoration","none")})
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

// funzione che disegna gli eventi nel context
function drawEventContext(){
    var b = x.bandwidth()
   for (var i in mlist){
        var film = mlist[i]
        if(elist[film] != undefined){
            var e = elist[film]["events"];
            var delta = b/e.length;
            for(var j in e){
                var hero = e[j][1]
                context.append("circle")
                    .attr("class","context event")
                    .attr('cx', x(film)+delta*j+13)
                    .attr('cy', y(hero)-482)
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
        
        var icon = focus.selectAll(".img.icon").data(newdom)
        var crown = focus.selectAll(".crown.icon").data(newdom)

        icon.exit().remove();
        icon.enter().append("image").attr("class","img icon")
            .attr('x', function(){
                if(newdom.length<9){return 20}
                if(newdom.length<14){return 26}
                if(newdom.length<20){return 32}
            })
            .attr('width', function(){
                if(newdom.length<9){return 48}
                if(newdom.length<14){return 36}
                if(newdom.length<20){return 24}
            })
            .attr('height', function(){
                if(newdom.length<9){return 48}
                if(newdom.length<14){return 36}
                if(newdom.length<20){return 24}
            })
            .attr("xlink:href", function(d){return "../hero_icon/"+heroToIcon[d]});
        icon.transition().duration(updateTime/2)
            .attr('x', function(){
                if(newdom.length<9){return 20}
                if(newdom.length<14){return 26}
                if(newdom.length<20){return 32}
            })
            .attr('width', function(){
                if(newdom.length<9){return 48}
                if(newdom.length<14){return 36}
                if(newdom.length<20){return 24}
            })
            .attr('height', function(){
                if(newdom.length<9){return 48}
                if(newdom.length<14){return 36}
                if(newdom.length<20){return 24}
            })
            .attr("xlink:href", function(d){return "../hero_icon/"+heroToIcon[d]});

        crown.exit().remove();
        crown.enter().append("circle").attr("class","crown icon").attr("id",function(d){return d})
            .attr('cx', 44)
            .attr('r', function(){
                if(newdom.length<9){return 24}
                if(newdom.length<14){return 18}
                if(newdom.length<20){return 12}
            })
            .attr('stroke', function(d) {return heroToColor[d]})
            .attr("stroke-width", "2px")
            .attr("fill", "red")
            .attr("fill-opacity", "0.0");
        crown.attr("id",function(d){return d}).attr('cx', 44)
            .attr('r', function(){
                if(newdom.length<9){return 24}
                if(newdom.length<14){return 18}
                if(newdom.length<20){return 12}
            })
            .attr('stroke', function(d) {return heroToColor[d]})
            .attr("stroke-width", "2px")
            .attr("fill", "red")
            .attr("fill-opacity", "0.0");
        
        var yL = y_focus.range()[0];
        var deltaL = (yL-y_focus.range()[1]) / (newdom.length - 1);
        for (var h in newdom){
            var node = focus.selectAll(".img.icon")["_groups"][0][h]
            if(newdom.length == 1){var val = yL/2 - 37}
            if(newdom.length > 1){var val = yL - (deltaL*h) -48}
            if(newdom.length>=9){var val = yL - (deltaL*h) -43}
            if(newdom.length>=14){var val = yL - (deltaL*h) - 37}
            node.setAttribute("y", val)
        }
        for (var h in newdom){
            var node = focus.selectAll(".crown.icon")["_groups"][0][h]
            if(newdom.length == 1){
                node.setAttribute("cy", yL/2 + y_focus.range()[1] - 42)
            }
            else{
                node.setAttribute("cy", yL - (deltaL*h) - 24)
            }
            
        }
        focus.selectAll(".icon").style("transform","translate(25px,24px)")
        focus.select(".y.focus").selectAll(".tick text").style("display","none")

        if(newdom.length>18){
            focus.selectAll(".icon").remove()
            focus.select(".y.focus").selectAll(".tick text").style("display","block")
            focus.selectAll(".y.focus .tick text").on("click",function(){popOutMenu(this.innerHTML,"hero")})
        }
        focus.selectAll(".icon").on("click",function(){ popOutMenu(this.id,"hero")});
        
}

function popOutMenu(value,type){

    if(isVisible){
        infoBox.selectAll("div").transition().duration(500).style("opacity","0").remove()
    }
    if(type == "hero"){
        var img = heroToIcon[value];
        var descr = heroData[value];
        infoBox.style("border-color",heroToColor[value])
        infoBox.append("div").transition().delay(500)
            .attr("class","name")
            .style("margin-left",25)
            .text(value);
        infoBox.append("div").append("img").transition().delay(500)
            .attr("class","poster")
            .attr("src","../hero_icon/"+img);
        infoBox.append("div").transition().delay(500)
            .style("font-size","14px")
            .style("font-family","cursive")
            .text(descr);
        isVisible = true;
    }
    if(type == "film"){
        var obj = {};
        for(var i in filmData){
            if(filmData[i]["film"] == value)
                obj = filmData[i];
        }
        infoBox.style("overflow-y","scroll")
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
        isVisible = true;
    }
    
    infoBox.transition().duration(updateTime)
           .style("transform","translate(-280px,0px)")
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
                focus.append("circle")
                    .attr("class","focus event")
                    .attr('cx', x_focus(film)+delta*j + 130)
                    .attr('cy', y_focus(hero))
                    .attr('r', function(){
                        if(y_focus.domain().length <= 9){return 12}
                        if(y_focus.domain().length <= 14){return 10}
                        else {return 8}
                    })
                    .attr('fill', function(d) {return heroToColor[hero]})
                    .attr("eventDetail",e[j][0])
                    .style("opacity","0")
                    .on("mouseover",function(d){
                        var x = d3.event.srcElement.getAttribute("cx");
                        var y = d3.event.srcElement.getAttribute("cy");
                        var e = d3.event.srcElement.getAttribute("eventDetail");
                        popUpEvent(parseFloat(x),parseFloat(y),e);
                    })
                   .on("mouseout",function(){
                        d3.select("body").selectAll(".baloon").remove()//.transition().delay(updateTime/3)
                    });
                    
            }
        }
    }
    d3.selectAll(".focus.event").transition().duration(updateTime).style("opacity","1");
}

function popUpEvent(x,y,e){

    d3.select(".top").append("div").attr("class","baloon")
        .style("width",dimBaloon.width)
        .style("height",dimBaloon.height)
        .append("p").text(e)

    if((x-100) <= xL/2 && (y-y_focus.range()[1]) <= yL/2){  //siamo in alto a sinistra -> speech baloon in basso a destra
        d3.select("body").selectAll(".baloon")
            .style("background","url('../icon/speech-baloon-bd.png')")
            .style("background-size","100% 100%")
            .style("transform","translate("+(x)+"px,"+(y+15)+"px)")
        d3.select("body").selectAll(".baloon p")
            .style("transform","translate(0px,-410px)")
    }
    if((x-100) <= xL/2 && (y-y_focus.range()[1]) > yL/2){   //siamo in basso a sinistra -> speech baloon in alto a destra
        d3.select("body").selectAll(".baloon")
            .style("background","url('../icon/speech-baloon-ad.png')")
            .style("background-size","100% 100%")
            .style("transform","translate("+(x)+"px,"+(y-270)+"px)")
        d3.select("body").selectAll(".baloon p")
            .style("transform","translate(0px,-450px)")
    }
    if((x-100) > xL/2 && (y-y_focus.range()[1]) <= yL/2){   //siamo in alto a destra -> speech baloon in basso a sinistra
        d3.select("body").selectAll(".baloon")
            .style("background","url('../icon/speech-baloon-bs.png')")
            .style("background-size","100% 100%")
            .style("transform","translate("+(x-455)+"px,"+(y+15)+"px)")
        d3.select("body").selectAll(".baloon p")
            .style("transform","translate(-10px,-410px)")
    }
    if((x-100) > xL/2 && (y-y_focus.range()[1]) > yL/2){    //siamo in basso a destra -> speech baloon in alto a sinistra
        d3.select("body").selectAll(".baloon")
            .style("background","url('../icon/speech-baloon-as.png')")
            .style("background-size","100% 98%")
            .style("background-repeat","no-repeat")
            .style("transform","translate("+(x-450)+"px,"+(y-265)+"px)")
        d3.select("body").selectAll(".baloon p")
            .style("transform","translate(-10px,-460px)")
    }
    

}

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
    return newDomain.length
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
                        popUpEvent(parseFloat(x),parseFloat(y),e);
                        
                    })
                   .on("mouseout",function(){
                        d3.select("body").selectAll(".baloon").remove()//.transition().delay(updateTime/3)
                    });
                }
                    
            }
        }
    }
    d3.selectAll(".focus.event").transition().duration(updateTime).style("opacity","1");
}


function filterAndHero(){
    filtered = []
    mlist.forEach(function(movie){      
        includesAll = true
        heroes = elist[movie]['heroes']
        y_focus.domain().forEach(function(hero){
            if(!heroes.includes(hero)){
                includesAll = false
            }
        })
        if(includesAll){
            filtered.push(movie)
        }
    })
    return filtered
}

function createFilterPage(){
    var filterPageSelectionHeroList = d3.select(".filter-box-hero")
    filterPageSelectionHeroList.append("h3")
        .text("Seleziona l'eroe")
    filterPageSelectionHeroList.append("ul")
    var filterPageSelectionMovieList = d3.select(".filter-box-movie")
    filterPageSelectionMovieList.append("h3")
        .text("Seleziona il film")
    filterPageSelectionMovieList
        .append("input")
        .attr("id","filtroAND")
        .attr("class", "checkbox AND")
        .attr("type","checkbox")
        .attr("disabled","true")
        .on("change",function(){
            if(this.checked){
                d3.select(".checkbox.movie").property("checked", false)
                if(!firstSelectionHero){
                    temp = filterAndHero()
                    x_focus.domain(temp)
                    d3.select(".x.focus")
                      .transition()
                      .duration(updateTime)
                      .call(xAxis_focus)
                    updateEventFocusWithFilter()
                    tickFocusResize()
                    createFilmArea()
                    
                }

            }
            else{
                updateFocusX(brushPos[0]+100,brushPos[1]+100)
                d3.select(".x.focus")
                    .transition()
                    .duration(updateTime)
                    .call(xAxis_focus)
                updateEventFocusWithFilter()
                tickFocusResize();
                createFilmArea()
            }
        })

    filterPageSelectionMovieList.append("label")
              .attr("id","label_filtroAND")
              .attr("for","filtroAND")
              .text("Inserisci i film con tutti gli eroi che hai selezionato")
              .style("font-weight","bold")
              .style("font-size","14px")

    filterPageSelectionMovieList.append("ul")

    hlist.forEach(function(hero){
        elem = filterPageSelectionHeroList.select("ul").append("li")
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
                    d3.select(".checkbox.AND").attr("disabled",null)
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
                    d3.select(".checkbox.AND").property("checked",false)
                    d3.select(".checkbox.AND").attr("disabled","true")
                    if(firstSelectionMovie){
                        var xd = updateFocusX(brushPos[0]+100,brushPos[1]+100)
                        var yd = updateFocusY(xd)
                        drawIcon(yd)
                        d3.select(".y.focus")
                            .transition()
                            .duration(updateTime)
                            .call(yAxis_focus)
                        d3.select(".x.focus")
                            .transition()
                            .duration(updateTime)
                            .call(xAxis_focus)
                        updateEventFocus(); 
                    }
                    else{
                        /*DA GESTIRE IL CASO IN CUI SVUOTO IL FILTRO*/
                        var yd = updateFocusY(x_focus.domain())
                        drawIcon(yd)
                        d3.select(".y.focus")
                            .transition()
                            .duration(updateTime)
                            .call(yAxis_focus)
                        updateEventFocus();
                    }
                    createFilmArea()
                    tickFocusResize()
                }

                else{
                    y_focus.domain(temp)
                    d3.select(".y.focus")
                    .transition()
                    .duration(updateTime)
                    .call(yAxis_focus)
                    drawIcon(y_focus.domain())
                    updateEventFocusWithFilter()
                }

             }
              })

        elem.append("label")
              .attr("for",id)
              .text(hero)
              
    })

    mlist.forEach(function(movie){
        elem = filterPageSelectionMovieList.select("ul").append("li")
        id = movie+"_movie_checkbox"
        elem.append("input")
        .attr("id",id)
        .attr("class", "checkbox movie")
        .attr("type","checkbox")
        .attr("value",movie)
        .on("change", function(){
            if(this.checked){
                if(d3.select(".checkbox.AND").property("checked").valueOf()){
                    d3.select(".checkbox.AND").property("checked", false)
                }               
                if(firstSelectionMovie){
                    domainBeforeFilter = x_focus.domain()
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
                createFilmArea();

                 }
            else{
                val = String(this.value)
                temp = x_focus.domain()
                temp = temp.filter(function(movie){
                    return !(movie == val)
                })
                if(temp.length == 0){
                    firstSelectionMovie = true
                    if(firstSelectionHero){
                        var xd = updateFocusX(brushPos[0]+100,brushPos[1]+100)
                        console.log(xd)
                        var yd = updateFocusY(xd)
                        drawIcon(yd)
                        d3.select(".y.focus")
                            .transition()
                            .duration(updateTime)
                            .call(yAxis_focus)
                        d3.select(".x.focus")
                            .transition()
                            .duration(updateTime)
                            .call(xAxis_focus)
                        updateEventFocus();
                        tickFocusResize();
                    }
                    else{
                        updateFocusX(brushPos[0]+100,brushPos[1]+100)
                        d3.select(".x.focus")
                            .transition()
                            .duration(updateTime)
                            .call(xAxis_focus)
                        updateEventFocusWithFilter()
                        tickFocusResize();
                    }

                }
                else{
                    x_focus.domain(temp)
                    d3.select(".x.focus")
                        .transition()
                        .duration(updateTime)
                        .call(xAxis_focus)
                    if(firstSelectionHero){
                        updateEventFocus()
                        tickFocusResize()
                    }
                    else{
                        updateEventFocusWithFilter()
                        tickFocusResize()
                    }
                }

                createFilmArea();

                }
            })  

        elem.append("label")
              .attr("for",id)
              .text(movie)
              
    })
}

d3.json("../data/MCU-heroToIcon.json")
    .then(function(data){
        heroToIcon = data;
        d3.json("../data/MCU-heroToColor.json")
            .then(function(data){
                heroToColor = data;
                d3.json("../data/MCU-hero-description.json")
                    .then(function(data){
                        heroData = data;
                        hlist = Object.keys(heroData);
                        y.domain(hlist);
                        d3.json("../data/MCU-film-description.JSON")
                            .then(function(data){
                                filmData = data;
                                for(var i in filmData){
                                    mlist.push(filmData[i]["film"])
                                }
                                x.domain(mlist);
                                d3.json("../data/MCU-events-dataset.json")
                                    .then(function(data){
                                        elist = data;
                                        createFocus();
                                        createBrush();
                                        createFilterPage();
                                        createFilmArea();
                                        drawEventContext();
                                        updateEventFocus();
                                        
                                    })
                                    .catch(function(error) {
                                        console.log(error); // Some error handling here
                                    });
                            })
                            .catch(function(error) {
                                console.log(error); // Some error handling here
                            });
                    })
                    .catch(function(error) {
                        console.log(error); // Some error handling here
                    });
            })
            .catch(function(error) {
                console.log(error); // Some error handling here
            });
    })
    .catch(function(error) {
        console.log(error); // Some error handling here
    });