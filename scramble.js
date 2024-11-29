(() => {
  const message = {
    salt: null,
    iv: null,
    encrypted: null,
    secretKey: null,
    additionalData: null,
    scrambled: null,
  };
   
  const scramble = (code) => {
    const encrypted = document.querySelector("#encrypted-message").value;
    const encryptedBytes = encrypted.match(/.{1,2}/g);
    const indexByteArr = code.match(/.{1,2}/g).map(i => parseInt(i) - 1);

    for (i = 0; i < indexByteArr.length; i+=2) {
      const indexPair = indexByteArr.slice(i, i+2);
      const curr = encryptedBytes[indexPair[0]];
      const next = encryptedBytes[indexPair[1]];
      encryptedBytes[indexPair[0]] = next;
      encryptedBytes[indexPair[1]] = curr;
    }

    const scrambledValue = document.querySelector(".scrambled .scrambled-value");
    scrambledValue.textContent = `${encryptedBytes.join('').substring(0, 12)}...[${encryptedBytes.length} bytes total]`;
    message.scrambled = encryptedBytes.join('');
  }

  const unscramble = (code) => {
    const scrambled = document.querySelector("#scrambled-encrypted-message").value;
    const scrambledBytes = scrambled.match(/.{1,2}/g);
    const indexByteArr = code.match(/.{1,2}/g).map(i => parseInt(i) - 1);

    for (i = indexByteArr.length-1; i >= 0; i-=2) {
      const indexPair = indexByteArr.slice(i-1, i+1);
      const curr = scrambledBytes[indexPair[0]];
      const next = scrambledBytes[indexPair[1]];
      scrambledBytes[indexPair[0]] = next;
      scrambledBytes[indexPair[1]] = curr;
    }

    const unscrambledValue = document.querySelector(".unscrambled .unscrambled-value");
    unscrambledValue.textContent = `${scrambledBytes.join('').substring(0, 12)}...[${scrambledBytes.length} bytes total]`;
    document.querySelector('#encrypted-message').value = scrambledBytes.join('');
    message.encrypted = scrambledBytes.join('');
  }

  const saveToFile = () => {
    if (message.scrambled !== null && message.scrambled != "") {
      const filename = "scrambled-key.txt";
      saveOrOpenBlob(new Blob([message.scrambled]), filename || "scrambled-key.txt");
    } else {
      alert("Please, scramble the encrypted seed first...")
    }
  };

  const saveOrOpenBlob = (blob, fileName) => {
    const tempEl = document.createElement("a");
    document.body.appendChild(tempEl);
    const url = window.URL.createObjectURL(blob);
    tempEl.href = url;
    tempEl.download = fileName;
    tempEl.click();
    window.URL.revokeObjectURL(url);
  };

  const loadScrambledKeyFromFile = (event, fileSelected) => { 
    //Set the extension for the file 
    var fileExtension = /text.*/; 
    //Get the file object 
    var fileTobeRead = fileSelected.files[0];
   //Check of the extension match 
    if (fileTobeRead.type.match(fileExtension)) { 
        //Initialize the FileReader object to read the 2file 
        var fileReader = new FileReader(); 
        fileReader.onload = function (event) { 
         const scrambled = document.querySelector("#scrambled-encrypted-message");
         scrambled.value = fileReader.result; 
        } 
        fileReader.readAsText(fileTobeRead); 
    } else { 
        alert("Please select scrambled text file"); 
    }
  };

  const scrambleMain = () => {
    // Scramble code accepts numeric only input
    const numericValidation = (evt) => {
      if (evt.keyCode < 48 || evt.keyCode > 57) {
        evt.preventDefault();
      }
    }

    const scrambleValidation = (message, input, button) => {
      const code = input.value;
      const bytePairs = code.match(/.{1,2}/g);
      const maxByte = Math.max.apply(0, bytePairs);
      const messageBytes = message.match(/.{1,2}/g);
      const valid = code.length > 0 && message.length > 0 && messageBytes.length > maxByte && (code.length % 4 == 0);
  
      input.style = valid ? "color:green" : "color:red";
      button.disabled = !valid
    }

    const scrambleCodeValidation = (evt) => {
      const encrypted = document.querySelector("#encrypted-message").value;
      scrambleValidation(encrypted, scramblecodeInput, scrambleButton);
    }

    const unscrambleCodeValidation = (evt) => {
      const scrambled = document.querySelector("#scrambled-encrypted-message").value;
      scrambleValidation(scrambled, unscramblecodeInput, unscrambleButton);
    }

    const scramblecodeInput = document.querySelector("#scramblecode");

    scramblecodeInput.addEventListener("keypress", numericValidation);
    scramblecodeInput.addEventListener("keyup", scrambleCodeValidation);

    const scrambleKeyCheckbox = document.querySelector(".encrypt #scramble-checkbox");
    scrambleKeyCheckbox.disabled = true;
    scrambleKeyCheckbox.checked = false;
    scrambleKeyCheckbox.addEventListener("click", () => {
      const scrambleKeyCtrl = document.querySelector(".encrypt .scramble-controls");
      scrambleKeyCtrl.style.display = scrambleKeyCheckbox.checked ? "block" : "none";
    });

    const scrambleButton = document.querySelector(".scramble .scramble-button");
    scrambleButton.disabled = true;
    scrambleButton.addEventListener("click", async () => {
      scramble(scramblecodeInput.value);
    });

    const scrambledSaveButton = document.querySelector(".encrypt .scrambled-save-button");
    scrambledSaveButton.addEventListener("click", () => {
      saveToFile();
    });

    const unscramblecodeInput = document.querySelector("#unscramblecode");

    unscramblecodeInput.addEventListener("keypress", numericValidation);
    unscramblecodeInput.addEventListener("keyup", unscrambleCodeValidation);

    const unscrambleKeyCheckbox = document.querySelector(".decrypt #scramble-checkbox");
    unscrambleKeyCheckbox.disabled = false;
    unscrambleKeyCheckbox.checked = false;
    unscrambleKeyCheckbox.addEventListener("click", () => {
      const decryptButton = document.querySelector(".decrypt .decrypt-button");
      decryptButton.style.marginLeft = unscrambleKeyCheckbox.checked ? "1rem" : "0rem";
      const unscrambleCtrl = document.querySelector(".decrypt .scramble-controls");
      unscrambleCtrl.style.display = unscrambleKeyCheckbox.checked ? "initial" : "none";      
      const loadButton = document.querySelector(".decrypt .load-button");
      loadButton.style.display = unscrambleKeyCheckbox.checked ? "none" : "initial";
      const messageControl = document.querySelector(".decrypt .message-control");
      messageControl.style.display = unscrambleKeyCheckbox.checked ? "none" : "initial";
    });

    const unscrambleButton = document.querySelector(".decrypt .unscramble-button");
    unscrambleButton.disabled = true;
    unscrambleButton.addEventListener("click", async () => {
      unscramble(unscramblecodeInput.value);
    });

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      const fileSelected = document.querySelector(".decrypt .unscramble-load-button");
      fileSelected.addEventListener('change', (e) => { 
        loadScrambledKeyFromFile(e, fileSelected);
      }, false);
    } else { 
      alert("Files are not supported"); 
    } 

  }

  scrambleMain();
 })();
