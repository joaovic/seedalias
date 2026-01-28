(() => {
  // Represents the secret message that could be sent
  const message = {
    salt: null,
    iv: null,
    encrypted: null,
    secretKey: null,
    additionalData: null,
  };
    
  const hashValue = val =>
    crypto.subtle
    .digest('SHA-256', new TextEncoder('utf-8').encode(val))
    .then(h => {
      let hexes = [], view = new DataView(h);
      for (let i = 0; i < view.byteLength; i += 4)
        hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
      return hexes.join('');
    }
  );
  
  const hexStringToArrayBuffer = (str) =>{
    const hexLetters = str.split("")
    const intCodes = [];

    for(let i=0; i < hexLetters.length; i+=2) {
      const hexCode = "0x"+hexLetters[i]+hexLetters[i+1];
      const intCode = parseInt(hexCode, 16);
      intCodes.push(intCode);
    }

    return new Uint8Array(intCodes);
  };
  
  const arrayBufferToHexString = (buffer) => {
    const byteArray = new Uint8Array(buffer);
    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        const paddedHexCode = hexCode.padStart(2, '0');
        return paddedHexCode;
    });
  
    return hexCodes.join('');
  };

  /*
  Get some key material to use as input to the deriveBits method.
  The key material is the passphrase supplied by the user.
  */
  const getKeyMaterial = passphrase => {
    const enc = new TextEncoder();

    return window.crypto.subtle.importKey(
      "raw", 
      enc.encode(passphrase), 
      {name: "PBKDF2"}, 
      false, 
      ["deriveBits", "deriveKey"]
    );
  };

  /*
    Derive a key from a password supplied by the user.
  */
  const getDerivedKey = async (keyMaterial, salt) => {
    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  };

  /*
    Fetch the contents of the "message" textbox, and encode it
    in a form we can use for the encrypt operation.
    */
  const getMessageEncoding = () => {
    const msg = document.querySelector("#seed").value;
    const enc = new TextEncoder();
    return enc.encode(msg);
  };

  const asUint8Array = async (val, s) => {
    const arr = new Uint8Array(s);

    return window.crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(val))
    .then(h => {
      const view = new DataView(h);

      for (let i = 0; i < s; i++) {
        arr[i] = view.getUint8(i);
      }

      return arr;
    });
  };

  /*
    Encrypt the message using the secret key.
    Update the "encryptedValue" box with a representation of part of
    the encrypted seed.
    */
  const encrypt = async () => {
    const passphraseValue = document.querySelector("#encrypt-passphrase").value;
    if (passphraseValue == null || passphraseValue.trim() === "") {
      alert("Please, provide the passphrase...");
      return;
    }

    document.querySelector("#decrypt-passphrase").value = passphraseValue;

    await calcMessageData(passphraseValue);

    const encryptedValue = document.querySelector(".encrypt .encrypted-value");
    encryptedValue.textContent = "";
    const decryptedValue = document.querySelector(".decrypt .decrypted-value");
    decryptedValue.textContent = "";

    const key = await getDerivedKey(message.secretKey, message.salt);
    const encodedMessage = getMessageEncoding();

    message.encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: message.iv,
        additionalData: message.additionalData,
      },
      key,
      encodedMessage
    );

    encryptedValue.classList.add("fade-in");
    encryptedValue.addEventListener("animationend", () => {
      encryptedValue.classList.remove("fade-in");
    });
    
    const encryptedMessage = arrayBufferToHexString(message.encrypted);
    encryptedValue.textContent = `${encryptedMessage.substring(0, 12)}...[${message.encrypted.byteLength} bytes total]`;
    
    document.querySelector("#encrypted-message").value = encryptedMessage;

    const scrambleKeyCheckbox = document.querySelector(".encrypt #scramble-checkbox");
    scrambleKeyCheckbox.disabled = false;
  }

  const saveToFile = () => {
    if (message.encrypted !== null && message.encrypted != "") {
      const filename = "encrypted-key.txt";
      const encrypted = document.querySelector("#encrypted-message");
      saveOrOpenBlob(new Blob([encrypted.value]), filename || "encrypted.txt");
    } else {
      alert("Please, encrypt the seed first...")
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

  const loadKeyFromFile = (event, fileSelected) => { 
    //Set the extension for the file 
    var fileExtension = /text.*/; 
    //Get the file object 
    var fileTobeRead = fileSelected.files[0];
   //Check of the extension match 
    if (fileTobeRead.type.match(fileExtension)) { 
        //Initialize the FileReader object to read the 2file 
        var fileReader = new FileReader(); 
        fileReader.onload = function (event) { 
         const encrypted = document.querySelector("#encrypted-message");
         encrypted.value = fileReader.result; 
        } 
        fileReader.readAsText(fileTobeRead); 
    } else { 
        alert("Please select text file"); 
    }
  };

  /*
    Decrypt the message using the secret key.
    If the encrypted was decrypted successfully,
    update the "decryptedValue" box with the decrypted value.
    If there was an error decrypting,
    update the "decryptedValue" box with an error message.
    */
  const decrypt = async () => {
    const passphraseValue = document.querySelector("#decrypt-passphrase").value;

    if (passphraseValue == null || passphraseValue.trim() === "") {
      alert("Please, provide the passphrase...");
      return;
    }

    await calcMessageData(passphraseValue);

    const decryptedValue = document.querySelector(".decrypt .decrypted-value");
    decryptedValue.textContent = "";
    decryptedValue.classList.remove("error");

    const encryptedValue = document.querySelector("#encrypted-message").value;

    // Convert the encrypted message from text to ArrayBuffer
    const encryptedBuf = hexStringToArrayBuffer(encryptedValue);
    const key = await getDerivedKey(message.secretKey, message.salt);

    try {
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: message.iv,
          additionalData: message.additionalData,
        },
        key,
        encryptedBuf
      );

      const dec = new TextDecoder();
      decryptedValue.classList.add("fade-in");
      decryptedValue.addEventListener("animationend", () => {
        decryptedValue.classList.remove("fade-in");
      });
      decryptedValue.textContent = dec.decode(decrypted);
    } catch (e) {
      decryptedValue.classList.add("error");
      decryptedValue.textContent = "*** Decryption error ***";
    }
  };

  const calcMessageData = async passphrase => {
    const passphraseHash = await hashValue(passphrase);
    message.salt = await asUint8Array(passphraseHash, 32);
    message.iv = await asUint8Array(passphraseHash.split("").reverse().join(""), 16);
    message.secretKey = await getKeyMaterial(passphraseHash);
    message.additionalData = await asUint8Array(passphraseHash.substring(16), 16);
  }

  function addTogglerEventListener(passphrase, toggler) {
    var passphraseElem = document.getElementById(passphrase);
    var togglerElem = document.getElementById(toggler);
    
    showHidePassphrase = () => {
      if (passphraseElem.type == 'password') {
        passphraseElem.setAttribute('type', 'text');
        togglerElem.classList.add('fa-eye-slash');
      } else {
        togglerElem.classList.remove('fa-eye-slash');
        passphraseElem.setAttribute('type', 'password');
      }
    };

    togglerElem.addEventListener('click', showHidePassphrase);
  }

  function seedAliasMain() {
    addTogglerEventListener('encrypt-passphrase', 'encrypt-toggler');
    addTogglerEventListener('decrypt-passphrase', 'decrypt-toggler');
    addTogglerEventListener('scramblecode', 'scramblecode-toggler');
    addTogglerEventListener('unscramblecode', 'unscramblecode-toggler');

    const encryptButton = document.querySelector(".encrypt .encrypt-button");
    encryptButton.addEventListener("click", async () => {
      await encrypt();
    });

    const saveButton = document.querySelector(".encrypt .save-button");
    saveButton.addEventListener("click", () => {
      saveToFile();
    });

    const decryptButton = document.querySelector(".decrypt .decrypt-button");
    decryptButton.addEventListener("click", async () => {
      await decrypt();
    });

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      const fileSelected = document.querySelector(".decrypt .load-button");
      fileSelected.addEventListener('change', (e) => { 
        loadKeyFromFile(e, fileSelected);
      }, false);
    } else { 
      alert("Files are not supported"); 
    } 

  }

  seedAliasMain();
 })();
