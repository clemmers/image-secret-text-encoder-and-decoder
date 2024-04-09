
let stream = [];

function decToExpBin( number ) {
    let stringone = number.toString(2);
    if ( stringone.length % SIZEOF_EXPANSION_CELL !== 0 ) {
        stringone = stringone.padStart(stringone.length + SIZEOF_EXPANSION_CELL - stringone.length % SIZEOF_EXPANSION_CELL, '0');
    }
    let stronelen = stringone.length;
    for( let i = 0, k = SIZEOF_EXPANSION_CELL; i < stronelen / SIZEOF_EXPANSION_CELL - 1; i++ ) {
        stringone = stringone.substring(0, k) + "1" + stringone.substring(k);
        k += SIZEOF_EXPANSION_CELL + 1;
    }
    stringone += "0";

    return stringone;

}


function file_to_binary() {
    const file_input = document.getElementById('files_input');

    let filesbindata = "";
    
    for ( let i = 0; i < file_input.files.length; i++ ) {
        const file = file_input.files[i];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                console.log("collected data, converting to binary");
                let binary_data = arrayBufferToBinary(event.target.result);
                console.log("data converted to binary");
                let nameBin = message_to_binary(file.name);
                filesbindata += '1' + decToExpBin(nameBin.length) + nameBin + decToExpBin(binary_data.length) + binary_data;

                if ( i < file_input.files.length - 1 ) {
                    filesbindata += '1';
                } else {
                    filesbindata += '0';
                    add_secret_to_image ( filesbindata );
                }
            };
    
            reader.onerror = function(e) {
                console.log('error : ' + e.type);
            };
            console.log("collecting file data..");
            reader.readAsArrayBuffer(file);
        } else {
            console.error("no file");
            alert("error no file: expect the output to not work");
        }
    }
    
}

function addStringToStream ( string ) {
    for ( let i = 0; i < string.length; i++ ) {
        stream.push ( parseInt ( string[i] ) );
    }
}

function addNumberToStream ( num ) {
    stream.push ( num );
}

function addArrayToStream ( arr ) {
    for ( let i = 0; i < arr.length; i++ ) {
        stream.push ( arr[i] );
    }
}

function arrayBufferToBinary(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    return Array.from(bytes, byte => byte.toString(2).padStart(8, '0')).join('');
}


function message_to_binary(message) {
    return (
        Array
        .from(message)
        .reduce((acc, char) => acc.concat(char.charCodeAt().toString(2).padStart(8, '0')), [])
        .join('')
    );
}






function error_message_too_long () {
    console.log("message too long");
    alert("message is too long");
}



/*
function message_to_binary(message) {
    return TYPE_UTF16 + (
        Array
        .from(message)
        .reduce((acc, char) => acc.concat(char.charCodeAt().toString(2).padStart(16, '0')), [])
        .join('')
    );
}
*/


function binDataToArrayOfNBitsInDecimal ( data, sizeOfClusterInBits ) {

    let i = 0;
    let dataArray = [];
    while (i < data.length) {

        let numberToWrite = parseInt ( data.substring( i, i + sizeOfClusterInBits ), 2);
        dataArray.push(numberToWrite);
        i+=sizeOfClusterInBits;

    }

    return dataArray;

}

// AND IF YOU GO I WANT TO GO WITH YOU
// AND IF YOU DIE I WANT TO DIE WITH YOU


function add_secret_to_image ( rawbindata ) {
    console.log("raw bin data: " + rawbindata);

    
    const input = document.getElementById('image_input');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0);

        const imageDataOG = context.getImageData(0, 0, canvas.width, canvas.height);
        const imageData = imageDataOG.data;

        let bitDepth;
        for ( let i = MIN_BIT_DEPTH; i <= MAX_BIT_DEPTH; i++ ) {

            let sizeOfClusterInExpBitForm = decToExpBin ( i );
            console.log("rawbindata.length " + rawbindata.length);

            // +1 because it includes the sizeoflastcelldata
            let lengthDataChunk = Math.ceil ( rawbindata.length / i ) + 1;
            console.log("lengthDataChunk " + lengthDataChunk);
            let lengthDataChunkInExpBitForm = decToExpBin ( lengthDataChunk );
            console.log("lengthDataChunkInExpBitForm " + lengthDataChunkInExpBitForm);
            let sizeOfLastCellData = rawbindata % i || i;
            console.log ( "calculated size of the stream: " + (CURRENT_VERSION_EXP_BIN.length + sizeOfClusterInExpBitForm.length + lengthDataChunkInExpBitForm.length + lengthDataChunk + 1) );
            console.log ( "size of image data " + imageData.length * 3 / 4 );
            if ( CURRENT_VERSION_EXP_BIN.length + sizeOfClusterInExpBitForm.length + lengthDataChunkInExpBitForm.length + lengthDataChunk + 1 <= imageData.length * 3 / 4 ) {
                bitDepth = i;
                console.log ( "bitdepth of " + bitDepth + " works." );
                
                // the current version
                addStringToStream ( CURRENT_VERSION_EXP_BIN );
                // how many bits of information will be saved in each of the following colors of each pixel of the image in binary
                addStringToStream ( sizeOfClusterInExpBitForm );
                // the length of information (in # of cells) using the previously stated bit depth
                // ( each color of each pixel is one cell, so three cells per pixel )
                addStringToStream ( lengthDataChunkInExpBitForm );
                // the amount of bits in the last cell of information ( may not be as much as the rest )
                addNumberToStream ( sizeOfLastCellData );
                // bin data stored as cells containing i djjw askjlkjwak xlk;jwkld;jawziwjdmnmcn
                addArrayToStream ( binDataToArrayOfNBitsInDecimal(rawbindata.substring ( 0, rawbindata.length - rawbindata.length % i ), i ) );
                // final cell that may or may not have less bits than the rest
                if ( rawbindata.length % i !== 0 ) {
                    addNumberToStream ( parseInt ( rawbindata.substring ( rawbindata.length - rawbindata.length % i ), 2 ) );
                }

                
                console.log ( "actual size of the stream: " + stream.length );
                console.log ( stream );

                break;
            }

            if ( i === MAX_BIT_DEPTH ) {
                console.log ( "not enough image space to store data... " );
                alert ( "not enough image space to store data... " );
                throw new FatalError("not enough image space to store data");
            }
        }




        console.log("writing data");

        let maxInNumBits = Math.pow(2, bitDepth);
        console.log (`maximum value with bit depth ${bitDepth} is ${maxInNumBits}`);

        let i = 0;
        let j = 0;

        console.log(stream);

        while (i < stream.length) {


            if( j > imageData.length ) {
                console.log("somethings abrew... trying to write outside of image");
            }

            // skip opacity
            if( j % 4 === 3 ) {
                j++;
            }

            let numberToWrite = stream[i];
            let currentDataNumber = imageData[j] % maxInNumBits;
            
            let optionOne = numberToWrite - currentDataNumber;
            let optionTwo;
            if ( numberToWrite < currentDataNumber ) {
                optionTwo = maxInNumBits + numberToWrite - currentDataNumber;
            } else {
                optionTwo = numberToWrite - currentDataNumber - maxInNumBits;
            }

            // makes optionOne always the one with least change in color
            if ( Math.abs ( optionOne ) > Math.abs ( optionTwo ) ) {
                let swap = optionOne;
                optionOne = optionTwo;
                optionTwo = swap;
            }

            if ( imageData[j] + optionOne >= 0 && imageData[j] + optionOne <= 255 ) {
                imageData[j] += optionOne;

            } else {
                imageData[j] += optionTwo;
            }


            if ( imageData[j] % maxInNumBits !== numberToWrite ) {
                console.log("UGHHHHHHHHH");
                console.log(`image data is ${imageData[j]} with index ${j}
                but the stream is ${numberToWrite} with index ${i}`);
            }
            
            i++;
            j++;

        }

        console.log("data written.. cleaning up");

        console.log("downloading image...");
        console.log("running putImageData");
        context.putImageData(imageDataOG, 0, 0);

        console.log("creating download link");
        const downloadLink = document.createElement('a');

        console.log("converting canvas to blob");
        canvas.toBlob((blob) => {
            console.log("setting href on download link");
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            console.log(downloadLink.href);

            console.log("setting download on download link");
            downloadLink.download = 'modified_image.png';
            console.log(downloadLink.download);

            console.log("clicking download link");
            downloadLink.click();

            console.log("revoking object URL");
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    img.src = URL.createObjectURL(input.files[0]);
}

/*
function add_secret_message ( message ) {

    
    const input = document.getElementById('image_input');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;


        console.log("checking if data is too large");
        available_storage = data.length * 3 / 4 - 1 - SIZEOF_HEADER;
        console.log("data to be written size: " + message.length + " bits");
        console.log("available storage: " + available_storage + " bits");

        if( message.length > available_storage) {
            console.log("not enough storage.. need " +
                (message.length - available_storage) +
                " more bits. image needs to be " +
                (message.length / available_storage) + "x the size it is now")
            error_message_too_long();
            return;
        }

        console.log("data check OK :)");

        console.log("writing data");

        let i = 0;
        let j = 0;
        while (i < message.length) {

            if( j > data.length ) {
                console.log("somethings abrew... trying to write outside of image");
            }

            if( j % 4 == 3 ) {
                j++;
            }

            data[j] -= data[j] % 2 - parseInt(message.charAt(i));

            // assert data is written correctly
            if( (data[j] % 2) != parseInt(message.charAt(i))) {
                console.error("UH OH!");
                console.error("message not written correctly, data is " + data[j] + " at index " + j + " and message code is " + message.charAt(i));
            }
            i++;
            j++;
        }

        console.log("data written.. cleaning up");

        // add a termination bit
        if( j % 4 == 3 ) {
            j++;
        }

        if( data[j] % 2 == 0) {
            data[j]++;
        }

        j++;

        // make the rest zero
        for( j; j < data.length; j++ ) {
            if ( j % 4 == 3) {
                j++;
            }

            // make current number even
            data[j] -= (data[j] % 2);

        }

        /*
        console.log("downloading image...");
        console.log("running putImageData");
        context.putImageData(imageData, 0, 0);

        console.log("creating download link");
        const downloadLink = document.createElement('a');
        console.log("setting href download link");
        downloadLink.href = canvas.toDataURL('image/png');
        console.log(downloadLink.href);
        console.log("setting download download link");
        downloadLink.download = 'modified_image.png';
        console.log(downloadLink.download);
        console.log("clicking download link");
        downloadLink.click();
        console.log("downloaded?");

        */

        /*

        console.log("downloading image...");
        console.log("running putImageData");
        context.putImageData(imageData, 0, 0);

        console.log("creating download link");
        const downloadLink = document.createElement('a');

        console.log("converting canvas to blob");
        canvas.toBlob((blob) => {
            console.log("setting href on download link");
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            console.log(downloadLink.href);

            console.log("setting download on download link");
            downloadLink.download = 'modified_image.png';
            console.log(downloadLink.download);

            console.log("clicking download link");
            downloadLink.click();

            console.log("revoking object URL");
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    img.src = URL.createObjectURL(input.files[0]);
}
*/