const SIZEOF_EXPANSION_CELL = 8;
const SIZEOF_VERSION_EXPANSION_CELL = 4;
const MIN_BIT_DEPTH = 1;
const MAX_BIT_DEPTH = 8;
const CURRENT_VERSION = 1;
const CURRENT_VERSION_EXP_BIN = getCurrentVersionExpBin();


// really bad code
// this function gets the current version in binary with the expansion method
function getCurrentVersionExpBin () {
    let num = CURRENT_VERSION;

    // prolly could get a better way of doing this but this works
    let stringone = num.toString(2);
    if ( stringone.length % SIZEOF_VERSION_EXPANSION_CELL !== 0 ) {
        stringone = stringone.padStart(stringone.length + SIZEOF_VERSION_EXPANSION_CELL - stringone.length % SIZEOF_VERSION_EXPANSION_CELL, '0');
    }
    let stronelen = stringone.length;
    for( let i = 0, k = SIZEOF_VERSION_EXPANSION_CELL; i < stronelen / SIZEOF_VERSION_EXPANSION_CELL - 1; i++ ) {
        stringone = stringone.substring(0, k) + "1" + stringone.substring(k);
        k += SIZEOF_VERSION_EXPANSION_CELL + 1;
    }
    stringone += "0";

    return stringone;

    /*

    while ( true ) {
        let numonemybrainisntworkingrn = num % i;

        binstring = numonemybrainisntworkingrn.toString(2).padStart(SIZEOF_VERSION_EXPANSION_CELL, '0') + binstring;
        num -= numonemybrainisntworkingrn;
        if ( num === 0 ) {
            break;
        }
        binstring = "1" + binstring;
        i*=2;
    }
    return binstring;
    */
};



// ALL OF THE FOLLOWING IS OUTDATED
// ALL OF THE FOLLOWING IS OUTDATED
// ALL OF THE FOLLOWING IS OUTDATED


/*

    header

    two bits are saved for type of secret data

    00 - UTF-8 text
    01 - UTF-16 text
    10 - MP3



    idea if image is too small ask user if they
    want to scale it up to fit the data


*/


const TYPE_MP3 = "10";
const TYPE_UTF8 = "00";
const TYPE_UTF16 = "01";
const SIZEOF_TYPE = 2;
const SIZEOF_HEADER = 2;
const INDEXOF_TYPE = 0;