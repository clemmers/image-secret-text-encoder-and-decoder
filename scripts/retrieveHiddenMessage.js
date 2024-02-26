


function decode_image() {
    const input = document.getElementById('image_input');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    let decoded_text = "";

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let header = "";
        let j = 0;


        while( j < SIZEOF_HEADER ) {

            if( j % 4 == 3 ) {
                j++;
            }

            header += data[j] % 2;

            j++;
        }

        console.log("header " + header);

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


function bin_to_mp3( secret_bin ) {

    //const bin_arr = new Uint8Array(secret_bin.match(/.{1,8}/g).map(byte => parseInt(byte, 2)));
    ////const bin_arr = new Uint8Array(secret_bin.split("").map(str => {return parseInt(str)}))
    //console.log("secret_bin: " + secret_bin);
    //console.log("bin_arr: " + bin_arr);
    const buffer = new ArrayBuffer(secret_bin.length / 8); // Assuming 8 bits per byte
    const view = new Uint8Array(buffer);

    for (let i = 0; i < secret_bin.length; i += 8) {
        const byte = secret_bin.substr(i, 8);
        view[i / 8] = parseInt(byte, 2);
    }

    //console.log("buffer: " + buffer);
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    const blob_url = URL.createObjectURL(blob);

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


    const download_link = document.createElement('a');
    download_link.href = blob_url;
    download_link.download = "secret_audio.mp3";
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

    document.getElementById("secret_message_output").innerText = decoded_text;
    
}

