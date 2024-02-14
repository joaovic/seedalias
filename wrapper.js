(() => {
  // Represents the secret message that could be sent
  const message = {
    salt: null,
    iv: null,
    secretKey: null,
    wrapped: null,
    hash: null,
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
  The key material is the password supplied by the user.
  */
  const getKeyMaterial = password => {
    const enc = new TextEncoder();

    return window.crypto.subtle.importKey(
      "raw", 
      enc.encode(password), 
      {name: "PBKDF2"}, 
      false, 
      ["deriveBits", "deriveKey"]
    );
  };

  /*
  Given some key material and some random salt
  derive an AES-KW key using PBKDF2.
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
      { name: "AES-KW", length: 256 },
      true,
      ["wrapKey", "unwrapKey"],
    );
  };

  const getMessageEncoding = (msg) => {
    const enc = new TextEncoder();
    return enc.encode(msg);
  };

  const getMessageDecoding = (msg) => {
    const dec = new TextDecoder();
    return dec.decode(unwrappedMessage);
  }

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

  const importKey = (rawKey) => {
    return window.crypto.subtle.importKey(
      "raw",
      rawKey,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  /*
    Wrap encrypted seed using provided user password.
    Update the "encryptedValue" box with a representation of part of
    the encrypted seed.
    */
  const wrapkey = async () => {
    const password = document.querySelector("#wrapkey-password").value;
    if (password == null || password.trim() === "") {
      alert("Please, provide the wrapper password...");
      return;
    }

    document.querySelector("#unwrapkey-password").value = password;

    await calcMessageData(password);

    const wrappedEncryptedValue = document.querySelector(".encrypt .wrapkey .wrapkey-controls .wrapped .wrapped-value");

    const key = await getDerivedKey(message.secretKey, message.salt);
    const buffer = hexStringToArrayBuffer(message.hash.substring(0, 32));
    const wrapperKey = await importKey(buffer);

    message.wrapped = await window.crypto.subtle.wrapKey(
      "raw",
      wrapperKey,
      key,
      "AES-KW"
    );

    wrappedEncryptedValue.classList.add("fade-in");
    wrappedEncryptedValue.addEventListener("animationend", () => {
      wrappedEncryptedValue.classList.remove("fade-in");
    });
    
    const wrappedEncryptedMessage = arrayBufferToHexString(message.wrapped);
    wrappedEncryptedValue.textContent = `${wrappedEncryptedMessage.substring(0, 12)}...[${message.wrapped.byteLength} bytes total]`;
    
    document.querySelector("#wrapped-encrypted-message").value = wrappedEncryptedMessage;
  }

  const saveToFile = () => {
    if (message.wrapped !== null && message.wrapped != "") {
      const filename = "encrypted-key-wrapped.txt";
      const wrapped = document.querySelector("#wrapped-encrypted-message");
      saveOrOpenBlob(new Blob([wrapped.value]), filename || "encrypted-key-wrapped.txt");
    } else {
      alert("Please, wrap the message first...")
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

  const loadWrappedKeyFromFile = (event, fileSelected) => { 
    //Set the extension for the file 
    var fileExtension = /text.*/; 
    //Get the file object 
    var fileTobeRead = fileSelected.files[0];
   //Check of the extension match 
    if (fileTobeRead.type.match(fileExtension)) { 
        //Initialize the FileReader object to read the 2file 
        var fileReader = new FileReader(); 
        fileReader.onload = function (event) { 
         const wrapped = document.querySelector("#wrapped-encrypted-message");
         wrapped.value = fileReader.result; 
        } 
        fileReader.readAsText(fileTobeRead); 
    } else { 
        alert("Please select text file"); 
    }
  };

  /*
    Unwrap the message using the secret key.
    If the encrypted was decrypted successfully,
    update the "decryptedValue" box with the decrypted value.
    If there was an error decrypting,
    update the "decryptedValue" box with an error message.
    */
  const unwrapkey = async () => {
    const passwordValue = document.querySelector("#unwrapkey-password").value;

    if (passwordValue == null || passwordValue.trim() === "") {
      alert("Please, provide the unwrapper password...");
      return;
    }

    await calcMessageData(passwordValue);

    const unwrappingKey = await getDerivedKey(message.secretKey, message.salt);

    const unwrappedValue = document.querySelector(".decrypt .wrapkey .unwrapped .unwrapped-value");
    unwrappedValue.textContent = "";
    unwrappedValue.classList.remove("error");

    const wrappedValue = document.querySelector("#wrapped-encrypted-message").value;

    const wrappedKeyBuffer = message.wrapped; //hexStringToArrayBuffer(message.wrapped); 

    try {
      const unwrappedKey = await window.crypto.subtle.unwrapKey(
        "raw",
        wrappedKeyBuffer,
        unwrappingKey,
        "AES-KW",
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
      );
      
      const wrappedValueBuf = hexStringToArrayBuffer(wrappedValue);
      const unwrappedMessage = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP"}, // , iv: message.iv },
        unwrappedKey,
        wrappedValueBuf
      );

      unwrappedValue.classList.add("fade-in");
      unwrappedValue.addEventListener("animationend", () => {
        unwrappedValue.classList.remove("fade-in");
      });
      unwrappedValue.textContent = getMessageDecoding(unwrappedMessage);
    } catch (e) {
      console.log(e);
      unwrappedValue.classList.add("error");
      unwrappedValue.textContent = "*** Unwrapping error ***";
    }
  };

  const calcMessageData = async password => {
    const passwordHash = await hashValue(password);
    message.hash = passwordHash;
    message.salt = await asUint8Array(passwordHash, 32);
    message.iv = await asUint8Array(passwordHash.split("").reverse().join(""), 16);
    message.secretKey = await getKeyMaterial(passwordHash);
  }

  function wrapperMain() {
    const wrapKeyCheckbox = document.querySelector(".encrypt #wrapkey-checkbox");
    wrapKeyCheckbox.addEventListener("click", () => {
      const wrapKeyCtrl = document.querySelector(".encrypt .wrapkey-controls");
      wrapKeyCtrl.style.display = wrapKeyCheckbox.checked ? "grid" : "none";
    });

    const wrapkeyButton = document.querySelector(".wrapkey .wrapkey-button");
    wrapkeyButton.addEventListener("click", async () => {
      await wrapkey();
    });

    const wrappedSaveButton = document.querySelector(".encrypt .wrapped-save-button");
    wrappedSaveButton.addEventListener("click", () => {
      saveToFile();
    });

    const unwrapKeyCheckbox = document.querySelector(".decrypt #wrapkey-checkbox");
    unwrapKeyCheckbox.addEventListener("click", () => {
      const unwrapKeyCtrl = document.querySelector(".decrypt .wrapkey-controls");
      unwrapKeyCtrl.style.display = unwrapKeyCheckbox.checked ? "grid" : "none";
    });

    const unwrapkeyButton = document.querySelector(".decrypt .unwrapkey-button");
    unwrapkeyButton.addEventListener("click", async () => {
      await unwrapkey();
    });

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      const fileSelected = document.querySelector(".decrypt .unwrap-load-button");
      fileSelected.addEventListener('change', (e) => { 
        loadWrappedKeyFromFile(e, fileSelected);
      }, false);
    } else { 
      alert("Files are not supported"); 
    } 

  }

  wrapperMain();
 })();
