// JavaScript source code
(async function () {


    const getPetBtn = document.getElementById('getPetBtn');  //кнопка получить питомца при первом заходе на сайт
    const byePetBtn = document.getElementById('byePetBtn');  //кнопка купить питомца
    const choisePetImageBtn_1 = document.getElementById('choisePetImageBtn_1');  //кнопка купить питомца #1
    const choisePetImageBtn_2 = document.getElementById('choisePetImageBtn_2');  //кнопка купить питомца #1
    const choisePetImageBtn_3 = document.getElementById('choisePetImageBtn_3');  //кнопка купить питомца #1
    const feedPetBtn = document.getElementById('feetPetBtn');  //кнопка кормить питомца

    const inputPetName = document.getElementById('inputPetName');



    getPetBtn.addEventListener('click', getPet);
    byePetBtn.addEventListener('click', byePet);
    choisePetImageBtn_1.addEventListener('click', 'click', () => selectPetImage(0));
    choisePetImageBtn_2.addEventListener('click', 'click', () => selectPetImage(1);
    choisePetImageBtn_3.addEventListener('click', 'click', () => selectPetImage(2));

    feedPetBtn.addEventListener('click', feedPet);



    let provider, signer, contract, cfg;
    let isConnecting = false;
    const pinataApiKey = "ВСТАВЬ_СВОЙ_API_KEY";                           // ключ в Pinata - изменить на свой!
    const pinataSecretApiKey = "ВСТАВЬ_СВОЙ_SECRET_API_KEY";
    const defaultImage = "https://gateway.pinata.cloud/ipfs/QmDefaultImage123";  // ссылка на изображение по умолчанию (для 1 питомца ) - изменить на своё!
    let chosenImage = null;
    let selectedTokenId = null;
    let tokenIds = [];
    let health;
    let experience;

    const petImagesAge_0 = [
        "https://gateway.pinata.cloud/ipfs/QmCatImage123...",  // ссылки на изображения питомцев - изменить на свои!
        "https://gateway.pinata.cloud/ipfs/QmDogImage456...",
        "https://gateway.pinata.cloud/ipfs/QmUnicornImage789..."
    ];

    async function loadConfig() {
        const res = await fetch('contractConfig.json');
        if (!res.ok) {
            log('contractConfig.json not found. Deploy the contract first.');
            return;
        }
        cfg = await res.json();
        contractAddrEl.textContent = cfg.address;


    }


    async function connect() {

        if (isConnecting) return;
        isConnecting = true;

        try {
            if (!window.ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            contract = new ethers.Contract(cfg.address, cfg.abi, signer);

            tokenIds = await contract.getMyPets();
            if (tokenIds.length != 0) {
                await loadMyPets();
            }
            
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            isConnecting = false;
        }
    }


    async function getPet() {                                                    // функция - получение питомца
        const petName = inputPetName.value.trim();

        if (!petName || !chosenImage) {
            alert("Введите имя и выберите изображение питомца.");
            return;
        }

        try {
            const imageUrl = defaultImage;                                                // 1. Загружаем изображение

            const metadata = {                                                          // 2. Готовим метаданные
                name: petName,
                description: `This is ${petName}, your new NFT pet!`,
                image: imageUrl,
                attributes: [
                    { trait_type: "Age", value: 0 },
                    { trait_type: "Health", value: 100 },
                    { trait_type: "Experience", value: 0 }
                ]
            };

       
            const tokenURI = await uploadMetadataToPinata(metadata);                     // 3. Загружаем метаданные

            const tx = await contract.getPet(petName, tokenURI, { value: 0 });          // 4. Вызываем контракт
            const receipt = await tx.wait();

            
            const event = receipt.events.find(e => e.event === "PetCreated");
            const tokenId = event.args.tokenId.toString();
            selectedTokenId = tokenId;
            console.log(`Pet created with Token ID: ${tokenId}`);
            alert(`🎉 Вы успешно завели питомца по имени ${petName}!`);
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    }

    async function byePet() {                                                    // функция - получение питомца
        const petName = inputPetName.value.trim();

        if (!petName || !chosenImage) {
            alert("Введите имя и выберите изображение питомца.");
            return;
        }

        try {
          
            const metadata = {                                                          //  Готовим метаданные
                name: petName,
                description: `This is ${petName}, your new NFT pet!`,
                image: chosenImage,
                attributes: [
                    { trait_type: "Age", value: 0 },
                    { trait_type: "Health", value: 100 },
                    { trait_type: "Experience", value: 0 }
                ]
            };


            const tokenURI = await uploadMetadataToPinata(metadata);                     //  Загружаем метаданные

            const tx = await contract.getPet(petName, tokenURI, { value: 0 });          //  Вызываем контракт
            await tx.wait();
            alert(`🎉 Вы успешно завели питомца по имени ${petName}!`);
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    }

    //ребования перед началом:

    // У тебя должен быть аккаунт на Pinata

    // Создай API - ключ в Pinata и вставь в код.



    async function uploadMetadataToPinata(metadata) {               //Вспомогательная функция — загрузка метаданные  на IPFS
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            },
            body: JSON.stringify({
                pinataMetadata: {
                    name: `PetMetadata-${metadata.name}`
                },
                pinataContent: metadata
            })
        });

        if (!response.ok) {
            throw new Error("Ошибка при загрузке метаданных на Pinata");
        }

        const result = await response.json();
        return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    }


    function selectPetImage(index) {
        chosenImage = petImagesAge_0[index];
        console.log("Выбрана картинка:", chosenImage);
    }

    async function loadMyPets() {
        tokenIds = await contract.getMyPets();
        const container = document.getElementById("petContainer");  //на фронте сделать контейнер с таким id для отображения питомцев
        container.innerHTML = "";

        for (let i = 0; i < tokenIds.length; i++) {
            const tokenId = tokenIds[i];
            const tokenURI = await contract.tokenURI(tokenId);
            const response = await fetch(tokenURI);
            const metadata = await response.json();

            // Создаем карточку питомца
            const card = document.createElement("div");
            card.classList.add("pet-card");
            card.innerHTML = `
            <img src="${metadata.image}" alt="${metadata.name}" />
            <h3>${metadata.name}</h3>
            <button onclick="selectPet(${tokenId})">Выбрать</button>
        `;

            container.appendChild(card);
        }
    }

    function selectPet(tokenId) {
        selectedTokenId = tokenId;
        alert("Выбран питомец с tokenId: " + tokenId);
        // можно отобразить его подробности, включить кнопку "Покормить", и т.д.
    }


    async function feedPet(selectedTokenId) {
        try {
            const tx = await contract.feedPet(selectedTokenId);
            await tx.wait();

            health = await contract.getPetHealth(selectedTokenId);
            experience = await contract.getPetExperience(selectedTokenId);
            alert(`🐾 Питомец покормлен!\nЗдоровье: ${health}\nОпыт: ${experience}`);
        }
        catch (e) {
            alert("Ошибка при кормлении питомца: " + e.message);
        }
    }

    window.onload = connect;
    await loadConfig();
})();