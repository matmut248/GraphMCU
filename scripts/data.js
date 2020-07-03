function loadData(){
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
    d3.json("../data/MCU-events-dataset.json")
        .then(function(data){
            //drawEventContext(data);
        })
        .catch(function(error) {
            console.log(error); // Some error handling here
        });

    d3.json("../data/marvel-graph.JSON")
        .then(function (data) { 
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
        })
        .catch(function(error) {
            console.log(error); // Some error handling here
        });
}