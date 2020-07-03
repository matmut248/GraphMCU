/**
 * FILE CHE CONTIENE FUNZIONI CHE AGISCONO
 * ESCLUSIVAMENTE SULLO STILE
 */


//funzione che cambia la grandezza dei tick x del focus in base alla quantità
function tickFocusResize(){
    switch(x_focus.domain().length){
        case 1:
        case 2:
        case 3:
            focus.selectAll(".x.focus .tick text").transition().duration(updateTime/2).style("font-size","20px");
            break;
        case 4: 
        case 5: 
            focus.selectAll(".x.focus .tick text").transition().duration(updateTime/2).style("font-size","15px");
            break;
        case 6:
        case 7: 
            focus.selectAll(".x.focus .tick text").transition().duration(updateTime/2).style("font-size","10px");
            break;
        default : focus.selectAll(".x.focus .tick text").transition().duration(updateTime/2).style("font-size","8px")
    }
}

//funzione che manda a capo il testo se supera una certa lunghezza
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
        }
    });
}