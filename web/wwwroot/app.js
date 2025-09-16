
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

    const feedPetBtn = document.getElementById('feedPetBtn');  //кнопка кормить питомца
    const feedPetBonusBtn = document.getElementById('feedPetBonusBtn');  //кнопка кормить питомца бонусом
    const sellPetBtn = document.getElementById('sellPetBtn');  //кнопка продать питомца
    const burnDeadPetBtn = document.getElementById('burnDeadPetBtn');  //кнопка сжечь мертвого питомца


    const inputPetName = document.getElementById('inputPetName');
    const inputPetNameBye = document.getElementById('inputPetNameBye');



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
    if (byePetBtn) {
        byePetBtn.addEventListener('click', byePet);
    }
     /*

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
    let petPrice = "0.01";                                             // цена питомца !
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
            }*/
            petPrice = await getPET_PRICE();
            petBonusFeedPrice = await getBONUS_FEED_PRICE();

            if (petPriceEl) petPriceEl.textContent = `Цена питомца: ${ethers.formatEther(petPrice)} ETH`;
            if (petBonusFeedPriceEl) petBonusFeedPriceEl.textContent = `Цена бонусного кормления: ${ethers.formatEther(petBonusFeedPrice)} ETH`;
            
            
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
        const petName = inputPetNameBye.value.trim();

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
            const value = ethers.parseEther(petPrice);

            const tx = await contract.getPet(petName, tokenURI, { value: value });          //  Вызываем контракт
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




    function selectImage(index) {
        chosenImage = petImagesAge_0[index];
        console.log("Выбрана картинка:", chosenImage);
    }

    async function loadMyPets() {
        try {
            tokenIds = await contract.getMyPets();
            const container = document.getElementById("petContainer");  //на фронте сделать контейнер с таким id для отображения питомцев

            if (!container) {
                return; 
            }

            if (tokenIds.length === 1) {
                container.classList.add("pet-сontainer");
            } else {
                container.classList.add("pet-сontainer-grid");
            }


            const manuallyNavigated = sessionStorage.getItem("manualNavigation");

            if (
                window.location.href.includes("index.html") &&
                tokenIds.length > 0 &&
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

                    const card = document.createElement("div");
                    card.classList.add("pet-card");
                    card.dataset.tokenId = tokenId;

                    const age = metadata.attributes.find(attr => attr.trait_type === "Age")?.value ?? '—';
                    const health = metadata.attributes.find(attr => attr.trait_type === "Health")?.value ?? '—';
                    const experience = metadata.attributes.find(attr => attr.trait_type === "Experience")?.value ?? '—';

                   
                    card.innerHTML = `
                        <div class="pet-card-item">
                            <div class="loader" id="avatarLoader-${i}"></div>
                            <div class="non-display pet-card-container" id="petContainer-item-${i}">
                                <img src="${metadata.image}" class="petLogo" id="petLogo-${i}" alt="${metadata.name}" />
                                <div class="petInfo-container">
                                    <h2 class="big-text text-decoratoin">${metadata.name}</h2>
                                    <h3 class="medium-text">Age: <span class="small-text">${age}</span></h3>
                                    <h3 class="medium-text">Health: <span class="small-text">${health}</span></h3>
                                    <h3 class="medium-text">Exp: <span class="small-text">${experience}</span></h3>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    const button = document.createElement("button");
                    button.className = "button-big select-pet-btn";
                    button.textContent = "Выбрать";

                    button.addEventListener("click", () => {
                        selectPet(tokenId); 
                    });

                   
                    card.appendChild(button);


                       
                    container.appendChild(card);

                    const img = document.getElementById(`petLogo-${i}`);
                    const container_item = document.getElementById(`petContainer-item-${i}`);
                    const loader = document.getElementById(`avatarLoader-${i}`);
                    if (img && loader) {
                        loader.style.display = "block";
                        img.style.display = "none";

                        img.addEventListener("load", () => {
                            loader.style.display = "none";
                            container_item.classList.remove('non-display');
                            img.style.display = "block";
                        });

                        img.addEventListener("error", () => {
                            loader.style.display = "none";
                            img.alt = "Ошибка загрузки изображения";
                            img.style.display = "block";
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Ошибка при загрузке питомцев:", e.message);
        }
    }

    async function selectPet(tokenId) {
        window.location.href = `dashboard.html?tokenId=${tokenId}`;
        console.log("Selecting pet with tokenId:", tokenId);
     
        
    }

    async function getPetStatus(tokenId) {
        try {
            if (!contract) {
               await connect();
            }


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
                if (!contract) {
                    throw new Error("Контракт не инициализирован");
                }

                const price = await contract.getPET_PRICE();
                return ethers.formatEther(price); 
            } catch (err) {
                console.error("Ошибка получения цены питомца:", err);
                return "0";
            }
        
    }

    async function getBONUS_FEED_PRICE() {
        try {
                if (!contract) {
                    throw new Error("Контракт не инициализирован");
                }

                const price = await contract.getBONUS_FEED_PRICE();
                return ethers.formatEther(price); 
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

    function getTokenIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("tokenId");
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const path = window.location.pathname;
        if (!path.endsWith("dashboard.html")) return;

        await loadConfig();
        await connect();

        const tokenId = getTokenIdFromURL();
        console.log("TokenId from URL:", tokenId);
        if (!tokenId) {
            console.error("tokenId не найден в URL");
            return;
        }

        try {
            const [name, health, lastFed, experience, age, status] = await getPetStatus(tokenId);
            const tokenURI = await contract.tokenURI(tokenId);
            const response = await fetch(tokenURI);
            const metadata = await response.json();
            
            if (nameEl) nameEl.textContent = name;
            if (healthEl) healthEl.textContent = ` ${health}`;
            if (lastFedEl) lastFedEl.textContent = ` ${lastFed}`;
            if (experienceEl) experienceEl.textContent = ` ${experience}`;
            if (ageEl) ageEl.textContent = ` ${age}`;
            if (statusEl) statusEl.textContent = ` ${status}`;

            const petImageEl = document.getElementById("selectedPetImage");
            if (petImageEl) {
                petImageEl.src = metadata.image;
                petImageEl.alt = name;
            }


           
            const loader = document.getElementById(`avatarLoader`);
            const dashboard = document.getElementById("dashboard");
            if (petImageEl && loader) {
                loader.style.display = "block";

                petImageEl.addEventListener("load", () => {
                    loader.style.display = "none";
                    dashboard.classList.remove('non-display');
                   
                });

                petImageEl.addEventListener("error", () => {
                    loader.style.display = "none";
                    petImageEl.alt = "Ошибка загрузки изображения";
                });
            }

        } catch (e) {
            console.error("Ошибка при загрузке данных питомца:", e);
        }
    });


    document.addEventListener("DOMContentLoaded", async function () {
        const path = window.location.pathname;

        if (path.endsWith("shop.html")) {
            const containerShop = document.getElementById("choisePet");
           


            petImagesAge_0.forEach((url, index) => {
                const card = document.createElement("div");
                card.className = "image-card";

                const img = document.createElement("img");
                img.src = url;
                img.alt = `Изображение ${index + 1}`;


                const price = document.createElement("div");
                price.textContent = petPrice + "ETH";

                const button = document.createElement("button");
                button.textContent = "Выбрать";
                button.classList.add("select-btn");
                button.classList.add("button-medium");

                button.addEventListener("click", () => {
                    selectImage(index);

                    const allCards = document.querySelectorAll(".image-card");
                    allCards.forEach((c) => c.classList.remove("selected"));

                    const allButtons = document.querySelectorAll(".select-btn");
                    allButtons.forEach((btn) => {
                        btn.classList.add("button-disabled");  
                        btn.textContent = "Выбрать";
                    });

                    
                    button.disabled = false;
                    button.classList.remove("button-disabled"); 
                    button.textContent = "✔️";
                    card.classList.add("selected");
                });

                card.appendChild(img);
                card.appendChild(price);
                card.appendChild(button);
                containerShop.appendChild(card);
            });
        }
    });

    window.onload = async function () {
        await loadConfig();
        await connect();


        await loadMyPets();
        petPrice = await getPET_PRICE();
        //petBonusFeedPrice = await getBONUS_FEED_PRICE();

        if (petPriceEl) petPriceEl.textContent = `Цена питомца: ${ethers.formatEther(petPrice)} ETH`;
       // if (petBonusFeedPriceEl) petBonusFeedPriceEl.textContent = `Цена бонусного кормления: ${ethers.formatEther(petBonusFeedPrice)} ETH`;
        /*
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