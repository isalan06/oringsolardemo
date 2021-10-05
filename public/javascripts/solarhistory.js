function SelectAll(){
    var getInverter = document.getElementsByName("checkInverter");
    for(var i=0;i<getInverter.length;i++){
        getInverter[i].checked = true;
    }
}