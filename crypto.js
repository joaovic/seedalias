(() => {
  // Represents the secret message that could be sent
  const message = {
    salt: null,
    iv: null,
    ciphertext: null,
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
    let msg = document.querySelector("#hkdf-message").value;
    let enc = new TextEncoder();
    return enc.encode(msg);
  };

  const asUint8Array = async (val, s) => {
    let arr = new Uint8Array(s);

    return window.crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(val))
    .then(h => {
      let view = new DataView(h);

      for (let i = 0; i < s; i++) {
        arr[i] = view.getUint8(i);
      }

      return arr;
    });
  };

  /*
    Encrypt the message using the secret key.
    Update the "ciphertextValue" box with a representation of part of
    the ciphertext.
    */
  const encrypt = async () => {
    const passphraseValue = document.querySelector("#encrypt-passphrase").value;
    if (passphraseValue == null || passphraseValue.trim() === "") {
      alert("Please, provide the passphrase...");
      return;
    }

    document.querySelector("#decrypt-passphrase").value = passphraseValue;

    await calcMessageData(passphraseValue);

    const ciphertextValue = document.querySelector(".encrypt .ciphertext-value");
    ciphertextValue.textContent = "";
    const decryptedValue = document.querySelector(".decrypt .decrypted-value");
    decryptedValue.textContent = "";

    const key = await getDerivedKey(message.secretKey, message.salt);
    const encodedMessage = getMessageEncoding();

    message.ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: message.iv,
        additionalData: message.additionalData,
      },
      key,
      encodedMessage
    );

    ciphertextValue.classList.add("fade-in");
    ciphertextValue.addEventListener("animationend", () => {
      ciphertextValue.classList.remove("fade-in");
    });
    
    const buffer = new Uint8Array(message.ciphertext, 0, 5);
    ciphertextValue.textContent = `${buffer}...[${message.ciphertext.byteLength} bytes total]`;
    
    const encryptedMessage = new TextEncoder().encode(ab2str(message.ciphertext));
    document.querySelector("#encrypted-message").value = encryptedMessage;

  }

  const saveToFile = () => {
    if (message.ciphertext !== null && message.ciphertext != "") {
      const encrypted = document.querySelector("#encrypted-message");
      encrypted.value = new TextEncoder("").encode(ab2str(message.ciphertext));
  
      const filename = "encrypted-key.txt";
      saveOrOpenBlob(new Blob([encrypted.value]), filename || "encrypted.txt");
    } else {
      alert("Please, encrypt the message first...")
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

  const ab2str = buf => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  const str2ab = str => {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
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
    If the ciphertext was decrypted successfully,
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

    await calcMessageData(passphraseValue)

    const decryptedValue = document.querySelector(".decrypt .decrypted-value");
    decryptedValue.textContent = "";
    decryptedValue.classList.remove("error");

    let encryptedValue = document.querySelector("#encrypted-message").value;

    // Convert the encrypted message from text to ArrayBuffer
    let encryptedBuf = str2ab(new TextDecoder().decode(Uint8Array.from(encryptedValue.split(',').map(Number)))); 
    let key = await getDerivedKey(message.secretKey, message.salt);

    try {
      let decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: message.iv,
          additionalData: message.additionalData,
        },
        key,
        encryptedBuf
      );

      let dec = new TextDecoder();
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

  function agreeSharedSecretKey() {
    let encryptButton = document.querySelector(".encrypt .encrypt-button");
    encryptButton.addEventListener("click", async () => {
      await encrypt();
    });

    let saveButton = document.querySelector(".encrypt .save-button");
    saveButton.addEventListener("click", () => {
      saveToFile();
    });

    let decryptButton = document.querySelector(".decrypt .decrypt-button");
    decryptButton.addEventListener("click", async () => {
      await decrypt();
    });

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      let fileSelected = document.querySelector(".decrypt .load-button");
      fileSelected.addEventListener('change', (e) => { 
        loadKeyFromFile(e, fileSelected);
      }, false);
    } else { 
      alert("Files are not supported"); 
    } 
  }

  agreeSharedSecretKey();
 })();
