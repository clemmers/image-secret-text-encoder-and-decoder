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