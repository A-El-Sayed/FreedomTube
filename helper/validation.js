// these validation do not return value;


async function checkIsProperString(str,strName){
    if(typeof str !== 'string' || str === null || str=== undefined){
        throw `${strName || 'provided variable'} should be string`;
    }
    if(str.trim().length == 0|| str.length == 0){
        throw `${strName || 'provided string'} cannot be empty or all spaces`
    }
}

async function checkIsLetterOrNum(str,strName){
    for (var i=0;i<str.length;i++) {
        var asc = str.charCodeAt(i);
        if (!(asc >= 65 && asc <= 90 || asc >= 97 && asc <= 122 || asc>=48 && asc<=57)) {
            throw `${strName || 'provided variable'} contains characters are not letters or number `;
        }
    }

}

async function checkIsOnlyLetter(str,strName){
    for (var i=0;i<str.length;i++) {
        var asc = str.charCodeAt(i);
        if (!(asc >= 65 && asc <= 90 || asc >= 97 && asc <= 122)) {
            throw `${strName || 'provided String'} should only contain letters `;
        }
    }

}

// check the person Name in regular way (Format: FirstName + LastName)
async function checkIsProperName(str,strName){
    await checkIsProperString(str,strName);
    await checkIsOnlyLetter(str.replace(/ /g, ""),strName);
    //check is only one space
    let trimString = str.trim().replace(/ /g, "");
    if(str.length-trimString.length!==1){
        throw `${strName || 'provided Name'} should only contain one space `;
    }
    let nameArr = [];
    nameArr= str.split(" ");
    if(nameArr.length!=2){
        throw `${strName || 'provided Name'} must be FirstName space LastName`;
    }
    for(var i = 0; i<nameArr.length;i++){
        var nameStr = nameArr[i];
        await checkIsProperString(nameStr,"first or last name");
        await checkIsOnlyLetter(nameStr,"first or last name");
        if(nameStr.length<2){
            throw `first or last name must at least be 3 characters long`;
        }
        if(!(nameStr.charCodeAt(0)>= 65 && nameStr.charCodeAt(0) <= 90)){
            throw `The initial letter of name should be uppercase`;
        }
    }

}

async function checkIsOnlyNum(numStr,name){
    for (var i=0;i<numStr.length;i++) {
        var asc = numStr.charCodeAt(i);
        if (!(asc>=48 && asc<=57)) {
            throw `${name || 'provided String'} is not only numbers`;
        }
    }
}

// Data format: 03/12/2022;
async function checkIsProperDate(date){
    await checkIsProperString(date,"date");
    dateArr = date.split("/");
    if(dateArr.length !== 3||dateArr[0].length!=2||dateArr[1].length!=2||dateArr[2].length!=4){
        throw `provided date format is not valid`;
    }
    let month = dateArr[0];
    let day = dateArr[1];
    let year = dateArr[2];
    await checkIsProperString(month,"month");
    await checkIsOnlyNum(month,"month");
    let intMonth = parseInt(month);
    if(intMonth<0 || intMonth>12){
        throw `provided month is not valid`;
    }
    
    await checkIsProperString(day,"day");
    await checkIsOnlyNum(day,"day");
    let intDay = parseInt(day);
    if(intMonth==2){
        if(intDay<1 || intDay>28){
            throw `provided day is not valid`;
        }
    }
    if(intMonth== 1|| intMonth == 3 || intMonth == 5 || intMonth == 7 || intMonth == 8 || intMonth == 10 || intMonth == 12){
        if(intDay<1 || intDay>31){
            throw `provided day is not valid`;
        }
    }
    if(intMonth == 4||intMonth == 6|| intMonth == 9 ||intMonth == 11){
        if(intDay<1||intDay>30){
            throw `provided day is not valid`;
        }
    }
    
    await checkIsProperString(year,"year");
    await checkIsOnlyNum(year,"year");
    let intYear = parseInt(year);
    var nowDate = new Date();
    if(intYear<1900||intYear>nowDate.getFullYear()+2){
        throw `provided year is not valid`;
    }
    
}


module.exports = {
    checkIsProperString,
    checkIsLetterOrNum,
    checkIsOnlyLetter,
    checkIsProperName,
    checkIsOnlyNum,
    checkIsProperDate
};