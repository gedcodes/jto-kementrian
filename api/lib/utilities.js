exports.padLeft = (num, size) => {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

exports.kelebihanBerat = async (brtTimbang, jbi) => {
    var kelebihan_berat = brtTimbang - jbi;

    if(kelebihan_berat < 0){
        return 0;
    }
    
    return kelebihan_berat;
}

exports.prosenKelebihanBerat = async(brtTimbang, jbi) => {
    var prosen = ((brtTimbang - jbi) / jbi) * 100;

    if(prosen < 0){
        return 0;
    }
    
    return prosen;
}