// i dont like how this is structured with all these different functions because they only work if all of the previous functions were run before
// to solve this issue is i could analyze the data first and save and place pointers at the beginning of each section and call to those for
// each function so that they work independently of eachother
// however is this just making it overly complicated??

let pointer = 0;

function decode_image ( data ) {

    //data = "0001000101000001101000011001010110110001101100011011110";
    pointer = 0;

    let version = get_encoded_version ( data );

    if( version > CURRENT_VERSION || version === 0 ) {
        console.log("this image is either not encoded with a message, the message has been lost in compression, or was encoded with a newer version.");
        alert("this image is either not encoded with a message, the message has been lost in compression, or was encoded with a newer version.");
        return;
    }

    console.log("message encoded with version " + version);
    console.log(`pointer is at position ${pointer}`);
    console.log( "getting expanded binary data" );
    let expandedBinData = get_expanded_bin_data ( data );
    console.log(`pointer is at position ${pointer}`);
    pointer = 0;


    console.log("starting to decode image data");

    while ( true ) {
        if ( following_data_is_file( expandedBinData ) ) {
            console.log("data is of type file");
            let filename = get_filename( expandedBinData );
            let filedata = get_data( expandedBinData );
            bin_to_file ( filedata, filename );
        } else {
            console.log("data is text");
            console.log(`${expandedBinData}, pointer: ${pointer}`);
            let textdata = get_data( expandedBinData );
            console.log("data " + textdata);
            bin_to_text ( textdata, 8 );
        }

        if ( !is_more_data( expandedBinData ) ) {
            break;
        }
        
    }

}

function get_expanded_bin_data ( data ) {
    let expandedBinData = "";
    
    let sizeOfCluster = get_expansion_number ( data );
    console.log("size of cluster: " + sizeOfCluster);
    let numberOfClusters = get_expansion_number ( data );
    console.log("number of clusters: " + numberOfClusters);
    let maxInNumBits = Math.pow(2, sizeOfCluster);
    for ( let i = pointer; i < pointer + numberOfClusters; i++ ) {
        expandedBinData += ( data[i] % maxInNumBits ).toString( 2 ).padStart( sizeOfCluster, '0' );
    }

    let sizeOfLastCellData = parseInt ( expandedBinData.substring ( 0, sizeOfCluster ), 2 );
    expandedBinData = expandedBinData.substring ( sizeOfCluster, expandedBinData.length - sizeOfCluster ) + expandedBinData.substring(expandedBinData.length - sizeOfLastCellData);
    let expandedBinDataArr = [];
    for ( let j = 0; j < expandedBinData.length; j++ ) {
        expandedBinDataArr.push(parseInt(expandedBinData[j]));
    }
    return expandedBinDataArr;

}

function get_expansion_number ( data ) {
    let numberBin = "";
    let counter = 0;
    while ( true ) {
        if ( counter > 100 ) {
            console.error("bruhhhh");
            return;
        }
        counter += SIZEOF_EXPANSION_CELL;
        //numberBin += data.substring(pointer, pointer + SIZEOF_EXPANSION_CELL);
        for ( let i = pointer; i < pointer + SIZEOF_EXPANSION_CELL; i++ ) {
            if ( typeof(data[i] % 2) !== "number" ) {
                console.log("bruh why");
                console.log(`index ${i} and data is ${data[i]} and data % 2 is ${data[i] % 2} and typeof data is ${typeof(data[i])}`);
                return;
            }
            console.log ("get expansion number " + data[i] % 2);
            numberBin += data[i] % 2;
        }
        pointer += SIZEOF_EXPANSION_CELL;
        if( data[pointer] % 2 === 0) {
            console.log ("end get expansion number");
            break;
        }
        pointer++;
    }
    pointer++;
    let number = parseInt( numberBin, 2 );
    return number;
}

function get_data ( data ) {
    console.log("getting stored data...");
    
    let dataLength = get_expansion_number( data );
    console.log("got length of data.");
    if (pointer + dataLength > data.length) {
        console.log("this image is either not encoded or all data has been lost. perhaps the image was compressed");
        alert("this image is either not encoded or all data has been lost. perhaps the image was compressed");
        return;
    }
    let dataBin = "";
    for ( let i = pointer; i < pointer + dataLength; i++ ) {
        dataBin += data[i] % 2;
    }
    pointer += dataLength;
    return dataBin;
}

function get_filename ( data ) {
    console.log("finding filename...");
    let filenameBin = get_data ( data );
    let filename = bin_to_text( filenameBin, 8 );
    console.log("filename is " + filename);
    return filename;
}

// bad code writing but my brain liks it like this
function following_data_is_file ( data ) {
    return 1 === data[pointer++];
}

function is_more_data ( data ) {
    return 1 === data[pointer++];
}

function get_encoded_version ( data ) {
    let versionBin = "";
    while ( true ) {
        for ( let i = pointer; i < pointer + SIZEOF_VERSION_EXPANSION_CELL; i++ ) {
            versionBin += data[i] % 2;
        }
        pointer += SIZEOF_VERSION_EXPANSION_CELL;
        if( data[pointer] % 2 === 0 ) {
            break;
        }
        pointer++;
    }
    pointer++;
    return parseInt ( versionBin, 2 );
}

function get_image_data () {
    const input = document.getElementById('image_input');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        console.log("drawing image");
        context.drawImage(img, 0, 0);
        console.log("image drawn");

        console.log("getting image data...");
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;
        console.log("stripping image data...");
        let strippedData = removeAlphaChannelInfo ( data );
        let testStr = "";
        for ( let i = 0; i < 400; i++ ) {
            testStr += strippedData[i] % 2;
        }
        console.log("FOR TESTING FOR THIS ONE SPECIFIC CASE:\n" + testStr);

        console.log("image data stripped and updated");
        decode_image( strippedData );
        //return data;
    }
    img.src = URL.createObjectURL(input.files[0]);
}



/*

function decode_image_oldfunction() {
    const input = document.getElementById('image_input');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    let decoded_text = "";

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        console.log("drawing image");
        context.drawImage(img, 0, 0);
        console.log("image drawn");

        console.log("getting image data...");
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        console.log("stripping image data...");
        data = removeAlphaChannelInfo(data);


        console.log("starting to decode image data");
        let versionBin = "";
        let j = 0;

        while ( true ) {
            versionBin += data.substring(j, j+SIZEOF_VERSION_EXPANSION_CELL);
            j += SIZEOF_VERSION_EXPANSION_CELL;
            if(data[j] === '0') {
                break;
            }
            j++;
        }


        version = parseInt(versionBin, 2);

        if( version > CURRENT_VERSION || version === 0 ) {
            console.log("this image is either not encoded with a message, the message has been lost in compression, or was encoded with a newer version.");
            alert("this image is either not encoded with a message, the message has been lost in compression, or was encoded with a newer version.");
            return;
        }

        console.log("message encoded with version " + version);

        let isFile = data[j];
        j++;

        if ( isFile === '1' ) {
            // first get length of filename in bits
            console.log("finding filename...");
            let filenameLengthBin = "";
            while ( true ) {
                filenameLengthBin += data.substring(j, j + SIZEOF_EXPANSION_CELL);
                j += SIZEOF_EXPANSION_CELL;
                if(data[j] === '0') {
                    break;
                }
                j++;
            }
            let filenameLength = parseInt( filenameLengthBin, 2 );
            let filenameBin = data.substring(j, j + filenameLength );
            j += filenameLength;
            let filename = bin_to_text( filenameBin, 8 );
            console.log("filename is " + filename);

            console.log("getting stored data...");

            let fileDataLengthBin = "";
            while ( true ) {
                fileDataLengthBin += data.substring(j, j + SIZEOF_EXPANSION_CELL);
                j += SIZEOF_EXPANSION_CELL;
                if(data[j] === '0') {
                    break;
                }
                j++;
            }
            let fileDataLength = parseInt( fileDataLengthBit, 2 );
            let fileDataBin = data.substring(j, j + fileDataLength );
            j += fileDataLength;
            console.log("stored data collected... converting to file for download!");
            bin_to_file(fileDataBin, filename);


        }


        let secret_bin = "";

        while (j < SIZEOF_HEADER + data.length) {
            
            if( j % 4 == 3 ) {
                j++;
            }
            
            secret_bin += (data[j] % 2);
            
            j++;
        }

        console.log("secret found");

        // strip excess information
        for( let p = secret_bin.length; p > 0; --p ) {
            if( secret_bin.charAt(p) == '1' ) {
                secret_bin = secret_bin.substring(0, p);
                break;
            }
        }

        console.log("secret stripped");


        let type = header.substring(INDEXOF_TYPE, INDEXOF_TYPE + SIZEOF_TYPE);

        switch(type) {
            case TYPE_UTF8:
                bin_to_text( secret_bin, 8 );
                break;
            case TYPE_UTF16:
                bin_to_text( secret_bin, 16 );
                break;
            case TYPE_MP3:
                bin_to_mp3( secret_bin );
                break;
            default:
                alert("invalid header..");
                break;
        }

    };

    img.src = URL.createObjectURL(input.files[0]);

}

*/


function bin_to_file( secret_bin, secret_filename ) {

    //const bin_arr = new Uint8Array(secret_bin.match(/.{1,8}/g).map(byte => parseInt(byte, 2)));
    ////const bin_arr = new Uint8Array(secret_bin.split("").map(str => {return parseInt(str)}))
    //console.log("secret_bin: " + secret_bin);
    //console.log("bin_arr: " + bin_arr);
    const buffer = new ArrayBuffer(secret_bin.length / 8); // assuming 8 bits per byte
    const view = new Uint8Array(buffer);

    for (let i = 0; i < secret_bin.length; i += 8) {
        const byte = secret_bin.substr(i, 8);
        view[i / 8] = parseInt(byte, 2);
    }

    //console.log("buffer: " + buffer);
    const blob = new Blob([buffer]);
    const blob_url = URL.createObjectURL(blob);


    /*
    let audio_element = new Audio();
    audio_element.src = blob_url;
    document.body.appendChild(audio_element);
    audio_element.onerror = function(e) {
        console.error("error playing audio:", e);
    };
    audio_element.play().then(function() {
        console.log("audio playback started");
    }).catch(function(error) {
        console.error("audio playback failed:", error);
    });

    */


    const download_link = document.createElement('a');
    download_link.href = blob_url;
    download_link.download = secret_filename;
    document.body.appendChild(download_link);
    download_link.click();
    document.body.removeChild(download_link);
    //URL.revokeObjectURL(blob_url);

    

}

function bin_to_text( secret_bin, num_bits ) {
    let decoded_text = "";

    let regex = new RegExp('.{1,' + num_bits + '}', 'g');

    secret_bin
        .match(regex)
        .map(bin => decoded_text += String.fromCharCode(parseInt(bin, 2)));

    document.getElementById("secret_message_output").innerText += decoded_text;
    return decoded_text;
    
}


function removeAlphaChannelInfo ( data ) {
    let newData = [];
    for ( let i = 0; i < data.length; i++ ) {
        if ( i % 4 === 3 ) {
            console.log('ur stupid');
        }
        newData.push( data[i] );
        newData.push( data[i+1] );
        newData.push( data[i+2] );
        i += 3;
    }
    return newData;
}
