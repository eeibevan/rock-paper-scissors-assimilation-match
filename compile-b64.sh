#!/bin/bash

echo "Compiling Assets";


printf "// This file is autogenerated by 'compile-b64.sh'\n" > sprites.ts;
printf "// any changes by hand will be overwritten\n\n" >> sprites.ts;


echo "Processing Rock"
printf "const rockImage = new Image();\n" >> sprites.ts;

printf "rockImage.src = " >> sprites.ts;
printf "\"data:image/png;base64,%s\";\n" "$(base64 -w 0 images/rock_sprite.png)" >> sprites.ts;


echo "Processing Paper"
printf "const paperImage = new Image();\n" >> sprites.ts;

printf "paperImage.src = " >> sprites.ts;
printf "\"data:image/png;base64,%s\";\n" "$(base64 -w 0 images/paper_sprite.png)" >> sprites.ts

echo "Processing Scissors"

printf "const scissorsImage = new Image();\n" >> sprites.ts;

printf "scissorsImage.src = " >> sprites.ts;

printf "\"data:image/png;base64,%s\";\n" "$(base64 -w 0 images/scissors_sprite.png)" >> sprites.ts

printf "export {rockImage, paperImage, scissorsImage};" >> sprites.ts;