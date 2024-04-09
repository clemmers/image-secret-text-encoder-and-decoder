<h1 align="center">image secret message hider</h1>
<p align="center"><strong>hide secret messages in images</strong>
<br/>

<h2>About</h2>

this is a tool that allows the user to store files inside of images. i wanted to build this because i think that the idea of hiding information where people would not expect it seems pretty cool. this works because i am taking advantage of the fact that
<br/>
1. if a pixels color was changed by only a few numbers, this will very likely not be noticed by the average person, and i would say that it even looks indistinguishable to the original.
<br/>
2. one can replace the last digits in the binary representation of a color with the information they want to store and then extract that information later, as long as they know where to look.

<h2>Goal and requirements</h2>
<br/>

 i knew that i had to create some sort of structure to the data that i store, so that when i want to decode an image, i know exactly where look. i also knew that i wanted each color of each pixel of the image to only store the minimum amount of data that was necessary (so as to minimize the amount of color change).so i came up with the following data structure to go by:
<br/>
<br/>
<br/>
 The first section of bits signify the version of the program using binary. since it is possible that the version may one day reach a number that would not be supported by a rigidly defined number of bits, i came up with an (almost definitely already existing) system that allows the number to have an arbitrary number of bits. after a preallocated number of bits (in this case for the version, its 4) there is an expansion bit that determines whether or not the next four bits are also part of the number (1 means theres more to the number). Once an off expansion bit is reached, it combines each of the previous chunks and reads it as one binary number. This system is widely used throughout my data structure.

 <br/>
 <br/>
 <br/>

 After the version is stated, the number of bits of information that each of the following colors will store is written as a number in binary using the expanded binary system established above.

 <br/>
 <br/>
 <br/>

 Then, the length of the rest of the data (how many cells the data is in (a cell being a color so 3 per pixel)) is written as a number in binary using the expanded binary system established above.

 <br/>
 <br/>
 <br/>

 After that, the following cells are not limited to binary, but can be any number that can be made using the number of bits that each color will store, which was previously written. since it is possible that this number does not divide evenly into the number of bits that the data contains, the next cell states how many bits of information the last cell contains. this number is stored in its decimal form. however, the structure of the rest of the data was still established in its binary form, so that is how it will be talked about.

 <br/>
 <br/>
 <br/>

 The rest of the data is just to store the data of the given files / text fields.
 <br/>
 <br/>

 If there is a file to be stored, a 1 is written to signify that it is a file rather than raw text. The following several bits are used to store the length (in bits) of the name of the file using the expansion number established above. then, the name of the file in binary. then, the length of the raw data of the file using the expansion number method. then, the raw binary of the file. after the data of the file, there is a 1 if there is more data after or a 0 if there is no more. This repeats for all files. If there is raw text to be stored, the process is similar. A 0 gets placed to signify that it is not a file, rather raw text. Then, the length of the binary data of the text is stored as an expanded binary number. Then, the raw binary of the text. Then, a 0 or a 1 depending on whether or not there is more data after to be stored.

 <br/>
 <br/>
 <br/>

 my website here implements this data structure.

 
 <h3>Sprint Goal</h3>
<strong>my goal for this final sprint is to implement a new data structure that allows the encoding of multiple messages / files into one image. also i want to make it so that the user can choose by how much each color of each pixel of the image can change / more variation in the colors of the image = more data that can be stored</strong><br/>

<h2>Key learnings</h2>
i learned that i really need think about how i write my effectively so as to not waste time refactoring it, and so that it is easy to read. i also learned more about javascript and how annoying it is. 

<h2>Running your project</h2>
Just head to the website linked in the repository, upload an image file, add your own files, and download the image with the secret data inside. Decoding the image is easier, all you need to do is upload the image and press decode :)

<h2>Misc.</h2>
the more data you are trying to store in the image, the more messed up the image will look! try to keep the data size to image size ratio low!
<br/>
also in my code i keep switching up spacing and naming conventions i may go back and fix that


