



function file_to_binary() {
    const file_input = document.getElementById('mp3_input');

    const file = file_input.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            console.log("collected data, converting to binary");
            const binary_data = arrayBufferToBinary(event.target.result);
            console.log("data converted to binary");
            let test = TYPE_MP3 + binary_data;
            //console.log(typeof(test));
            //console.log(test.length);
            add_secret_message(test);
        };

        reader.onerror = function(e) {
            console.log('error : ' + e.type);
        };
        console.log("collecting file data..");
        reader.readAsArrayBuffer(file);
    } else {
        console.error("no file");
    }
}

function arrayBufferToBinary(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    return Array.from(bytes, byte => byte.toString(2).padStart(8, '0')).join('');
}


function message_to_binary(message) {
    return TYPE_UTF8 + (
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

function add_secret_message( message ) {

    
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