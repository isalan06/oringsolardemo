

function prefixZeros(number, maxDigits) 
{  
    var length = maxDigits - number.toString().length;
    if(length <= 0)
        return number;

    var leadingZeros = new Array(length + 1);
    return leadingZeros.join('0') + number.toString();
}