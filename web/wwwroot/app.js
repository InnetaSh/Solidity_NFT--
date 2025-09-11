
(async function () {

    const nameEl = document.getElementById("petName");
    const healthEl = document.getElementById("petHealth");
    const lastFedEl = document.getElementById("petLastFed");
    const experienceEl = document.getElementById("petExperience");
    const ageEl = document.getElementById("petAge");
    const statusEl = document.getElementById("petStatus");

    const contractAddrEl = document.getElementById("contractAddress");

    const petPriceEl = document.getElementById("petPrice");
    const petBonusFeedPriceEl = document.getElementById("petBonusFeedPrice");

    const getPetBtn = document.getElementById('getPetBtn');  //кнопка получить питомца при первом заходе на сайт
    const openShopBtn = document.getElementById('openShopBtn');  //кнопка открыть магазин питомцев
    const byePetBtn = document.getElementById('byePetBtn');  //кнопка купить питомца
    const choisePetImageBtn_1 = document.getElementById('choisePetImageBtn_1');  //кнопка купить питомца #1
    const choisePetImageBtn_2 = document.getElementById('choisePetImageBtn_2');  //кнопка купить питомца #1
    const choisePetImageBtn_3 = document.getElementById('choisePetImageBtn_3');  //кнопка купить питомца #1

    const feedPetBtn = document.getElementById('feedPetBtn');  //кнопка кормить питомца
    const feedPetBonusBtn = document.getElementById('feedPetBonusBtn');  //кнопка кормить питомца бонусом
    const sellPetBtn = document.getElementById('sellPetBtn');  //кнопка продать питомца
    const burnDeadPetBtn = document.getElementById('burnDeadPetBtn');  //кнопка сжечь мертвого питомца


    const inputPetName = document.getElementById('inputPetName');



    //getPetBtn.addEventListener('click', getPet);
    if (getPetBtn) {
        getPetBtn.addEventListener('click', function (e) {
            e.preventDefault(); 
            getPet();
        });
    }
    if (openShopBtn) {
        openShopBtn.addEventListener('click', function (e) {
            e.preventDefault(); 
            goToShop();
        });
    }
    /*byePetBtn.addEventListener('click', byePet);
    choisePetImageBtn_1.addEventListener('click', () => selectPetImage(0));
    choisePetImageBtn_2.addEventListener('click', () => selectPetImage(1));
    choisePetImageBtn_3.addEventListener('click', () => selectPetImage(2));

    feedPetBtn.addEventListener('click', feedPet);
    feedPetBonusBtn.addEventListener('click', feedPetBonus);

    sellPetBtn.addEventListener('click', sellPet);
    burnDeadPetBtn.addEventListener('click', burnDeadPet);*/



    let provider, signer, contract, cfg;
    let isConnecting = false;
   // const pinataApiKey = "5fa105b1702db3a70bdb";                           
   // const pinataSecretApiKey = "5b403cce9f748764c813c476ba7e79c936ff2d97153b3b2f866dd6c463c7e85a";

    const JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2MTQ2ZGRkNC1mZDk4LTQ4NDMtOTlkNC02ZGJkNjUzYTk5ZDgiLCJlbWFpbCI6ImlubmV0YTNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjdkZjIxNjdjZWQ2ZDk5MGFiMGI0Iiwic2NvcGVkS2V5U2VjcmV0IjoiYjM5YzljN2FiZjMxMGVmNjEwYzdjZTQxOTFkYWI0YWFlMDcxNDBlOGVmMWU5NjRlZjhiYzBiODc1ZDBlZWVkNiIsImV4cCI6MTc4ODk3MDQ5OX0.maWoeIsrDcY4JL9ItBvJuQXMy8WWCShG1CbZ_I_29EE"; // токен JWT для Pinata (вместо apiKey и secretApiKey) 
    const defaultImage = "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm";  // ссылка на изображение по умолчанию (для 1 питомца )
    let chosenImage = null;
    let selectedTokenId = null;
    let tokenIds = [];
    let tokenId;

    let name, health, lastFed, experience, age, status;
    let petPrice = "0";                                             // цена питомца !
    let petBonusFeedPrice = "0";                                    // цена бонусного кормления питомца !

    let currentlySelectedCard = null;

    const petImagesAge_0 = [
        "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm",
        "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm", // пример
        "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm",
    ];

    async function loadConfig() {
        const res = await fetch('contractConfig.json');
        if (!res.ok) {
            log('contractConfig.json not found. Deploy the contract first.');
            return;
        }
        cfg = await res.json();
                console.log("Config loaded:", cfg);
       // contractAddrEl.textContent = cfg.address;


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

            /*tokenIds = await contract.getMyPets();
            if (tokenIds.length != 0) {
                await loadMyPets();
            }
            petPrice = await getPET_PRICE();
            petBonusFeedPrice = await getBONUS_FEED_PRICE();

            if (petPriceEl) petPriceEl.textContent = `Цена питомца: ${ethers.formatEther(petPrice)} ETH`;
            if (petBonusFeedPriceEl) petBonusFeedPriceEl.textContent = `Цена бонусного кормления: ${ethers.formatEther(petBonusFeedPrice)} ETH`;

            */
            await subscribeEvents();
            console.log("Connected to contract at:", cfg.address);
            
        } catch (e) {
            alert(" connection error: ")
            alert("Error: " + e.message);
        } finally {
            isConnecting = false;
        }
    }

    async function subscribeEvents() {
        if (!contract) {
            console.error("Contract is not initialized");
            return;
        }
        contract.on("PetCreated", async (tokenId, owner, event) => {
            console.log(`PetCreated: ID ${tokenId.toString()}`);
            await loadMyPets();
        });

        contract.on("PetDied", async (tokenId, newHealth, newExperience, event) => {
            if (selectedTokenId && selectedTokenId === tokenId.toString()) {
                await updatePetStats();
            }
        });

        contract.on("PetSold", async (tokenId, from, to, event) => {
            if (selectedTokenId && selectedTokenId === tokenId.toString()) {
                alert(`Питомец ${tokenId.toString()} был продан.`);
                selectedTokenId = null;
                await loadMyPets();
            }
        });

        contract.on("PetFed", async (tokenId, event) => {
            if (selectedTokenId && selectedTokenId === tokenId.toString()) {
                alert(`Питомец ${tokenId.toString()} был сожжен.`);
                selectedTokenId = null;
                await loadMyPets();
            }
        });
    }

    async function getPet() {            // функция - получение питомца
        petName = inputPetName.value.trim();
       
        if (!petName) {
            alert("Введите имя питомца.");
            return;
        }
        if (petName.length < 3 || petName.length > 20) {
            alert("Имя питомца должно содержать от 3 до 20 символов.");
            inputPetName.focus();
            return;
        }

        const validNamePattern = /^[A-Za-zА-Яа-яЁё0-9\s\-]+$/;
        if (!validNamePattern.test(petName)) {
            alert("Имя питомца может содержать только буквы, цифры, пробелы и дефисы.");
            inputPetName.focus();
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
            console.log(metadata);
       
            console.log("Начинаем загрузку метаданных на Pinata");
            const tokenURI = await uploadMetadataToPinata(metadata);
            console.log("Token URI:", tokenURI);
            console.log("Метаданные загружены, tokenURI:", tokenURI);                     // 3. Загружаем метаданные
      



            console.log("Отправляем транзакцию getPet");
            const tx = await contract.getPet(petName, tokenURI, { value: 0 });
            console.log("Транзакция отправлена, ожидаем подтверждения");
            const receipt = await tx.wait();
            console.log("Транзакция подтверждена", receipt);
            console.log("Логи транзакции:", receipt.logs);


            //const iface = new ethers.Interface(abi);
            for (const log of receipt.logs) {
                try {
                    const parsed = iface.parseLog(log);
                    if (parsed.name === "PetCreated") {
                        console.log("Parsed событие:", parsed);
                        tokenId = parsed.args.tokenId.toString();
                       
                        break;
                    }
                } catch (err) {
                    
                }
            }

            if (!tokenId) {
                console.error("Событие 'PetCreated' не найдено в логах транзакции.");
                alert("Питомец создан, но событие 'PetCreated' не получено.");
                return;
            }

            selectedTokenId = tokenId;
            
            console.log("tokenId:", tokenId);
            selectedTokenId = tokenId;

            name = petName;
            health = 100;
            experience = 0;
            age = 0;
            status = "Active";
            console.log(`Pet created with Token ID: ${tokenId}`);
            alert(`🎉 Вы успешно завели питомца по имени ${petName}!`);

            await loadMyPets();
        } catch (e) {
            console.error("Ошибка при создании питомца:", e);
            alert("Ошибка: " + (e.message || e));
        }
    }

    async function byePet() {                                                    // функция - получение питомца
        const petName = inputPetName.value.trim();

        if (!petName || !chosenImage) {
            alert("Введите имя и выберите изображение питомца.");
            return;
        }

        if (petName.length < 3 || petName.length > 20) {
            alert("Имя питомца должно содержать от 3 до 20 символов.");
            inputPetName.focus();
            return;
        }

        const validNamePattern = /^[A-Za-zА-Яа-яЁё0-9\s\-]+$/;
        if (!validNamePattern.test(petName)) {
            alert("Имя питомца может содержать только буквы, цифры, пробелы и дефисы.");
            inputPetName.focus();
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

            const tx = await contract.getPet(petName, tokenURI, { value: petPrice });          //  Вызываем контракт
            await tx.wait();
            name = petName;
            health = 100;
            experience = 0;
            age = 0;
            status = "Active";
            alert(`🎉 Вы успешно завели питомца по имени ${petName}!`);
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    }

    //ребования перед началом:

    // У тебя должен быть аккаунт на Pinata

    // Создай API - ключ в Pinata и вставь в код.


    
    async function uploadMetadataToPinata(metadata) {
        const payload = {
            pinataMetadata: { name: `PetMetadata-${metadata.name}` },
            pinataContent: metadata
        };

        console.log(">>> Пытаемся отправить POST /upload", payload);
        

        try {
            const response = await fetch("http://localhost:3000/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            
            const rawText = await response.text();
            console.log(">>> raw response text:", rawText);

          
            let result;
            try {
                result = JSON.parse(rawText);
            } catch (e) {
                console.error(">>> Ошибка при парсинге JSON:", e);
                throw new Error("Сервер вернул невалидный JSON");
            }

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Слишком много запросов к серверу. Попробуйте позже.");
                }
                throw new Error(`Ошибка при загрузке метаданных: ${response.status}`);
            }

            console.log(">>> Успешно загружено, результат:", result);

            
            return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        } catch (e) {
            console.error(">>> Ошибка fetch:", e);
            throw e;
        }
    }




    function selectPetImage(index) {
        chosenImage = petImagesAge_0[index];
        console.log("Выбрана картинка:", chosenImage);
    }

    async function loadMyPets() {
        try {
            tokenIds = await contract.getMyPets();
            const container = document.getElementById("petContainer");  //на фронте сделать контейнер с таким id для отображения питомцев

            const manuallyNavigated = sessionStorage.getItem("manualNavigation");

            if (tokenIds.length > 0 &&
                !window.location.href.includes("my-pets.html") &&
                !manuallyNavigated
            ) {
                window.location.href = "my-pets.html";
            }

            // После загрузки my-pets.html — очищаем флаг
            if (window.location.href.includes("my-pets.html")) {
                sessionStorage.removeItem("manualNavigation");
            }


            if (container) { 
                container.innerHTML = "";

                if (tokenIds.length === 0) {
                    container.innerHTML = "<p>У вас ещё нет питомцев.</p>";
                   // document.getElementById('selectedPetDetails').classList.add("non-display");
                    return;
                }
           

                    for (let i = 0; i < tokenIds.length; i++) {
                        const tokenId = tokenIds[i];
                        const tokenURI = await contract.tokenURI(tokenId);
                        const response = await fetch(tokenURI);
                        const metadata = await response.json();

                        // Создаем карточку питомца
                        const card = document.createElement("div");
                        card.classList.add("pet-card");
                        card.dataset.tokenId = tokenId;

                        const age = metadata.attributes.find(attr => attr.trait_type === "Age")?.value ?? '—';
                        const health = metadata.attributes.find(attr => attr.trait_type === "Health")?.value ?? '—';
                        const experience = metadata.attributes.find(attr => attr.trait_type === "Experience")?.value ?? '—';

                        if (tokenIds.length === 1 && !selectedTokenId) {  // если питомец один - выбираем его сразу (при загрузке страницы)

                            card.innerHTML = `
                            <div class="pet-card-container">
                                <img src="${metadata.image}" class="petLogo" alt="${metadata.name}" />
                                 <div>
                                    <h2>${metadata.name}</h2>
                                    <h3>Age: <span>${age}</span></h3>
                                    <h3>Health: <span>${health}</span></h3>
                                    <h3>Experience: <span>${experience}</span></h3>
                                    </div>
                                 </div>
                                <button class="button-big select-pet-btn" onclick="selectPet(${tokenId})">Выбрать</button>
               
                            `;
                        } else {
                            card.innerHTML = `
                            <div class="pet-card-container-grid">
                                <img src="${metadata.image}" class="petLogo" alt="${metadata.name}" />
                                 <div>
                                    <h2>${metadata.name}</h2>
                                    <h3>Age: <span>${age}</span></h3>
                                    <h3>Health: <span>${health}</span></h3>
                                    <h3>Experience: <span>${experience}</span></h3>
                                    </div>
                                 </div>
                                <button class="button-big select-pet-btn" onclick="selectPet(${tokenId})">Выбрать</button>
               
                            `;
                        }


                        card.querySelector(".select-pet-btn").addEventListener("click", async () => {
                            if (currentlySelectedCard) {
                                currentlySelectedCard.classList.remove("selected");
                            }
                            card.classList.add("selected");       //selected - класс для выделения выбранного питомца НУЖЕН В CSS!
                            currentlySelectedCard = card;

                            await selectPet(tokenId);
                        });

                        container.appendChild(card);
                }
            }
        } catch (e) {
            console.error("Ошибка при загрузке питомцев:", e.message);
        }
    }

    async function selectPet(tokenId) {
        try {
            selectedTokenId = tokenId;
            [name, health, lastFed, experience, age, status] = await getPetStatus(tokenId);

            const tokenURI = await contract.tokenURI(tokenId);
            const response = await fetch(tokenURI);
            const metadata = await response.json();

            if (nameEl) nameEl.textContent = name;
            if (healthEl) healthEl.textContent = `Здоровье: ${health}`;
            if (lastFedEl) lastFedEl.textContent = `Последнее кормление: ${lastFed}`;
            if (experienceEl) experienceEl.textContent = `Опыт: ${experience}`;
            if (ageEl) ageEl.textContent = `Возраст: ${age}`;
            if (statusEl) statusEl.textContent = `Статус: ${status}`;

           
            const petImageEl = document.getElementById("selectedPetImage");
            if (petImageEl) {
                petImageEl.src = metadata.image;
                petImageEl.alt = name;
            }
            
            alert("Выбран питомец с tokenId: " + tokenId);
        }
        catch (e) {
            alert("Ошибка при выборе питомца: " + e.message);
        }
        
    }

    async function getPetStatus(tokenId) {
        try {


            const [petName, petHealth, petLastFed, petExperience, petAge, petStatus] = await contract.getPetStatus(tokenId);


            name = petName;
            health = petHealth;
            lastFed = petLastFed;
            experience = petExperience;
            age = petAge;
            status = petStatus === 0 ? "Active" : "Dead";
            return [name, health, lastFed, experience, age, status];
        }
        catch (e) {
            alert("Ошибка при получении статуса питомца: " + e.message);
            return [null, null, null, null, null, null];
        }
    }


    async function feedPet() {
        if (!selectedTokenId) {
            alert("Сначала выберите питомца.");
            return;
        }
        try {
            const tx = await contract.feedPet(selectedTokenId);
            await tx.wait();

            health = await contract.getHealth(selectedTokenId);
            experience = await contract.getPetExperience(selectedTokenId);
            alert(`🐾 Питомец покормлен!\nЗдоровье: ${health}\nОпыт: ${experience}`);
        }
        catch (e) {
            alert("Ошибка при кормлении питомца: " + e.message);
        }
    }

    async function feedPetBonus() {
        if (!selectedTokenId) {
            alert("Сначала выберите питомца.");
            return;
        }

        try {

            const tx = await contract.feedPetBonus(selectedTokenId, { value: petBonusFeedPrice });

            await tx.wait();

            const health = await contract.getHealth(selectedTokenId);
            const experience = await contract.getPetExperience(selectedTokenId); // убедись, что эта функция есть в контракте

            alert(`🐾 Вы покормили питомца бонусом!\nЗдоровье: ${health}\nОпыт: ${experience}`);
        } catch (e) {
            alert("Ошибка при бонусном кормлении: " + e.message);
        }
    }



    async function updatePetStats() {                       // функция - обновление состояния питомца (здоровье и опыт) каждые 3 минуты
        if (!selectedTokenId) return;

        try {
            await contract.decayExperience(selectedTokenId);
            
            health = await contract.getHealth(selectedTokenId);
            experience = await contract.getPetExperience(selectedTokenId);

            console.log(`🔁 Обновление данных: здоровье: ${health}, опыт: ${experience}`);

            
            const [petName, petHealth, petLastFed, petExperience, petAge, petStatus] = await contract.getPetStatus(selectedTokenId);
            

            name = petName;
            health = petHealth;
            lastFed = petLastFed;
            experience = petExperience;
            age = petAge;
            status = petStatus === 0 ? "Active" : "Dead";

            
            if (nameEl) nameEl.textContent = name;
            if (healthEl) healthEl.textContent = `Здоровье: ${health}`;
            if (lastFed) lastFedEl.textContent = `Последнее кормление: ${lastFed}`;
            if (experienceEl) experienceEl.textContent = `Опыт: ${experience}`;
            if (ageEl) ageEl.textContent = `Возраст: ${age}`;
            if (statusEl) statusEl.textContent = `Статус: ${status}`;
        } catch (e) {
            console.error("Ошибка при обновлении состояния питомца:", e.message);
        }
    }


   
    async function sellPet() {                     // Продать питомца другому адресу
        if (!selectedTokenId) {
            alert("Сначала выберите питомца.");
            return;
        }
        const toAddress = prompt("Введите адрес покупателя:");
        if (!toAddress || !ethers.utils.isAddress(toAddress)) {
            alert("Неверный адрес");
            return;
        }
        try {
            const tx = await contract.sellPet(selectedTokenId, toAddress);
            await tx.wait();
            alert("Питомец продан!");
           
            await loadMyPets();
        } catch (e) {
            alert("Ошибка при продаже: " + e.message);
        }
    }

    
    async function burnDeadPet() {              // Сжечь мертвого питомца
        if (!selectedTokenId) {
            alert("Сначала выберите питомца.");
            return;
        }
        try {
            const petState = await contract.getPetState(selectedTokenId);
            if (petState !== 1) { 
                alert("Питомец не мертвый");
                return;
            }
            const tx = await contract.burnDeadPet(selectedTokenId);
            await tx.wait();
            alert("Мертвый питомец удалён");
            await loadMyPets();
        } catch (e) {
            alert("Ошибка при удалении: " + e.message);
        }
    }

    async function getPET_PRICE() {
        try {
            petPrice = await contract.getPET_PRICE();
        } catch (e) {
            alert("Ошибка при получении цены питомца: " + e.message);
            return "0";
        }
    }

    async function getBONUS_FEED_PRICE() {
        try {
            return await contract.getBONUS_FEED_PRICE();
        } catch (e) {
            alert("Ошибка при получении цены бонусного кормления: " + e.message);
            return "0";
        }
    }


    function goToShop() {
        // Устанавливаем флаг, чтобы предотвратить автоперенаправление
        sessionStorage.setItem("manualNavigation", "true");
        window.location.href = "shop.html";
    }

    document.addEventListener("DOMContentLoaded", function () {
        const path = window.location.pathname;

        if (path.endsWith("shop.html")) {
            const containerShop = document.getElementById("choisePet");

            petImagesAge_0.forEach((url, index) => {
                const card = document.createElement("div");
                card.className = "image-card";

                card.innerHTML = `
                <img src="${url}" alt="Изображение ${index + 1}">
                <button onclick="selectImage('${url}')">Выбрать</button>
            `;

                containerShop.appendChild(card);
            });
        }
    });

    window.onload = async function () {
        await loadConfig();
        await connect();


        await loadMyPets();
        /*petPrice = await getPET_PRICE();
        petBonusFeedPrice = await getBONUS_FEED_PRICE();

        if (petPriceEl) petPriceEl.textContent = `Цена питомца: ${ethers.formatEther(petPrice)} ETH`;
        if (petBonusFeedPriceEl) petBonusFeedPriceEl.textContent = `Цена бонусного кормления: ${ethers.formatEther(petBonusFeedPrice)} ETH`;
        
        tokenIds = await contract.getMyPets();
        if (tokenIds.length > 0) {
            selectedTokenId = tokenIds[0];  
            await loadMyPets();
            await updatePetStats();        
        }
        */
        
        //setInterval(updatePetStats, 3 * 60 * 1000);
    };
 
})();