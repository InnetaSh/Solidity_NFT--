
(async function () {

    const nameEl = document.getElementById("petName");
    const healthEl = document.getElementById("petHealth");
    const lastFedEl = document.getElementById("petLastFed");
    const experienceEl = document.getElementById("petExperience");
    const ageEl = document.getElementById("petAge");
    const statusEl = document.getElementById("petStatus");

    const feedErrorEl = document.getElementById("feedError");

    const contractAddrEl = document.getElementById("contractAddress");

    const petPriceEl = document.getElementById("petPrice");
    const petBonusFeedPriceEl = document.getElementById("petBonusFeedPrice");
    const petImageEl = document.getElementById("selectedPetImage");

    const getPetBtn = document.getElementById('getPetBtn');  //кнопка получить питомца при первом заходе на сайт
    const openShopBtn = document.getElementById('openShopBtn');  //кнопка открыть магазин питомцев
    const byePetBtn = document.getElementById('byePetBtn');  //кнопка купить питомца

    const feedPetBtn = document.getElementById('feedPetBtn');  //кнопка кормить питомца
    const feedPetBonusBtn = document.getElementById('feedPetBonusBtn');  //кнопка кормить питомца бонусом
    const sellPetBtn = document.getElementById('sellPetBtn');  //кнопка продать питомца
    const showSellPetBtn = document.getElementById('showSellPetBtn');  //кнопка показать форму продажи питомца
    const closeSellPetBtn = document.getElementById('closeSellPetBtn');  //кнопка закрыть форму продажи питомца
    const burnDeadPetBtn = document.getElementById('burnDeadPetBtn');  //кнопка сжечь мертвого питомца


    const inputPetName = document.getElementById('inputPetName');
    const inputPetNameBye = document.getElementById('inputPetNameBye');
    const petFormSellSection = document.getElementById('petFormSellSection');
    const inputSellAddress = document.getElementById('inputSellAddress');
    const inputSellPrice = document.getElementById('inputSellPrice');



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
     
    if (feedPetBtn) {
        feedPetBtn.addEventListener('click', feedPet);
    }
    if (feedPetBonusBtn) {
        feedPetBonusBtn.addEventListener('click', feedPetBonus);
    }
    if (sellPetBtn) {
        sellPetBtn.addEventListener('click', sellPet);
    }
    if (showSellPetBtn && petFormSellSection) {
        showSellPetBtn.addEventListener('click', function (e) {
            e.preventDefault();
            petFormSellSection.classList.remove('non-display');
            feedPetBtn.classList.add('non-display');
        });
    }

    if (closeSellPetBtn) {
        closeSellPetBtn.addEventListener('click', function (e) {
            e.preventDefault();
            petFormSellSection.classList.add('non-display');
            feedPetBtn.classList.remove('non-display');
        });
    }

    if (burnDeadPetBtn) {
        burnDeadPetBtn.addEventListener('click', burnDeadPet);
    }



    let provider, signer, contract, cfg, address;
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

    const statePet = {
        "0": "Active",
        "1": "Dead"
    };

    const timestamp = Date.now();
    const date = new Date(timestamp); 

    const formatted = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });





    let currentlySelectedCard = null;

    const petImagesAge_0 = [
        "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm",
        "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm", // пример
        "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm",
    ];


    const petImages = [
        [
            "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm",
            "https://gateway.pinata.cloud/ipfs/bafkreicufsktjmkvns7oyyo3xmutictoc57vsqo6kjbhq4eg5lt45rc4nu",
            "https://gateway.pinata.cloud/ipfs/bafkreigaabm7tr4mjv7b767vehj4o7nc2s2lhpxswzrmsbdh2eripvmany",
            "https://gateway.pinata.cloud/ipfs/bafkreiaovzzvlo443oxbixskibdhp2jlxbthd22zkp4inof5g4g4lyampi",
            "https://gateway.pinata.cloud/ipfs/bafkreicjlx4btknag3fwtqjtdrnwidnpe6hr7zk346hcnw2dnou4ztyyea",
            "https://gateway.pinata.cloud/ipfs/bafkreiau335uxd4kvq65d3kvwjlkv253ffqg6v6nbivm2nwnukcwm5rrgm",
        ],
        [
            "https://gateway.pinata.cloud/ipfs/bafybeid4ni6ak26pe7f7nvdxgmdl4vvhfxc7pje6l2zv5tozzlh42rcbtq",
            "https://gateway.pinata.cloud/ipfs/bafkreiejyvif773ehoaj5dxrput6guxuwdz7p7ahoidwt6lpk2tgqv3dvm",
            "https://gateway.pinata.cloud/ipfs/bafkreih2ve624cnff4nnzlnudknpaelhvlrohqqx36taafftvtng4qos4u",
            "https://gateway.pinata.cloud/ipfs/bafkreigpofnxplxvzj72tgpdvegh26bltsc3wmsnfgfrdsqh4xkq6d4hga",
            "https://gateway.pinata.cloud/ipfs/bafkreib3u732jcutgvpfwit7pr43wjnmvxow7yog3zgg3xgkmbder5kexm",
            "https://gateway.pinata.cloud/ipfs/bafkreiessrf773mdwchaw2ek346ghxbcocrq2ywp53peibksgxrwpoxdbu",
        ],
        [
            "https://gateway.pinata.cloud/ipfs/bafkreidd7yqozgtwlokrttk2o4leye2hvzovj2rzf6mtsz367c2d635ojq",
            "https://gateway.pinata.cloud/ipfs/bafkreig4ioiwfu3ref7bnb5i5h2tlkicpszm6ud54d25gkmjtzafdvek3y",
            "https://gateway.pinata.cloud/ipfs/bafkreic47pq6f4t5miozbql6fu2fxqd2uhwjkig65ypqctta6doquqgxmu",
            "https://gateway.pinata.cloud/ipfs/bafkreiaj3jluunuuexhatldmwcnhvmw6ijukjhorcgdbyziirq2c7w25ya",
            "https://gateway.pinata.cloud/ipfs/bafkreigtqshc2f7sjcblkpsol7i4vblw7siig7tahff3uttogcqy3datpa",
            "https://gateway.pinata.cloud/ipfs/bafkreibodcubpnbt3qh6cjiaf752nvfspbtrdlqnuni55aqkjkzprarwna",
        ],
        [
            "https://gateway.pinata.cloud/ipfs/bafkreidvm7g54b55xmkl2nhqxc3f5imdpm66pf3px4fah3nxpgi4cjohai",
            "https://gateway.pinata.cloud/ipfs/bafkreigvxguvexwskgzdnrdrlzj6n55g6frxckzpcwsx7cn4vyofugwx6u",
            "https://gateway.pinata.cloud/ipfs/bafkreicecu7s2wr6bnujdpdoleysddtlibhbhn3hsfj23p6o43zjqzog3a",
            "https://gateway.pinata.cloud/ipfs/bafkreifhr3q7bvezor5jw5gerncl5ued54y2vimydi4v5xkwbkgja2dwqe",
            "https://gateway.pinata.cloud/ipfs/bafkreicupvwx3fmgzhptky4yzj7ds3knf33xdsnvddu5hp52ciaovzp57y",
            "https://gateway.pinata.cloud/ipfs/bafkreiene6zyyyi3w3ii2nq6xqyfhyosxcf5l7hgc3mywfnkcdyytfuu2u",
        ],
        [
            "https://gateway.pinata.cloud/ipfs/bafkreiabht53mi7y3agqb6ghubo3hrsbegl3s7hnsk3ku4xmjnzzh6ph64",
            "https://gateway.pinata.cloud/ipfs/bafkreiabibhr2f5vqrihuogtw3uytnjfr3kqxyvdqxwah2cgrlayaekor4",
            "https://gateway.pinata.cloud/ipfs/bafkreig3bhywt5tiwzbag5ljturzl3g66bidw4rz6ghn355win4ejczem4",
            "https://gateway.pinata.cloud/ipfs/bafkreifpia2mulq3dgdshvvvrhylhlwfp5w6ui5xi2yq2dgwshytjpzu7u",
            "https://gateway.pinata.cloud/ipfs/bafkreiekwajkawmpfbwhf2e67rfflcvttdafy34qztycvdjz7acwremchm",
            "https://gateway.pinata.cloud/ipfs/bafkreibwpuhptptm3gg42zcofdvzcqzz55juxxrmsqlq4xwcnrxunsgrzu",
        ],
        [
            "https://gateway.pinata.cloud/ipfs/bafybeicigmkf3gl2k6m5q5ucad56fcxxm72etmyybjyex3qnbzhqucthxe",
            "https://gateway.pinata.cloud/ipfs/bafkreievqkohrxg7eleyqkqqwodukgpv5g4h5hzf5ztupookqyzpwndgum",
            "https://gateway.pinata.cloud/ipfs/bafybeibq4kskdopodxtgdpcygqdrufnoitx4as6ph3ihiatcd5j5etknai",
            "https://gateway.pinata.cloud/ipfs/bafybeia3fkrkwz3ido5wutbawu3y3wo7dqnl6dwi3vjm6zzacxcq2klnlq",
            "https://gateway.pinata.cloud/ipfs/bafybeibliwrqt4rlyjagrcjhrpu6kls673dretqhwh46nj6zs23wscw4yu",
            "https://gateway.pinata.cloud/ipfs/bafybeieoez3olfzhxi2azur6ewunmrbbapcrs33ss43u5k4w6cjguilkye",
        ],
        [
            "https://gateway.pinata.cloud/ipfs/bafkreihmtt2sq2isvcf6xzco6s3butzkrq67fismreosv5ohlndijedbnm",
            "https://gateway.pinata.cloud/ipfs/bafybeifdca24t7p47jeisromawd2uhtuaovftwn3q2h6qzgr5zmsb257fe",
            "https://gateway.pinata.cloud/ipfs/bafkreigmprrucnfttghpgx5ezkt3p4w5rv6qmb73ijknqrreqt7eoetaze",
            "https://gateway.pinata.cloud/ipfs/bafkreicu7rwatuoef6nonema5ztdev4r2oynasu5wc34wzmvhvyrmyj6q4",
            "https://gateway.pinata.cloud/ipfs/bafkreigckfid56sx7bqvpfwzdkshqm7xqcnozyk6fyixioqicaxynezdfe",
            "https://gateway.pinata.cloud/ipfs/bafkreifnm6i6runbclon3l3avrfkx5iuje2okppgpilhich47m545fb424",
        ],
       
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
            address = await signer.getAddress();
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
        await loadConfig(); 
        await connect();
        const petName = inputPetName.value.trim();
       
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

           

            const tokenId = await contract.getLastPetId(address);
            console.log(`🐶 Питомец создан! ID: ${tokenId}`);

            alert(`🎉 Вы успешно завели питомца по имени ${petName}!\nToken ID: ${tokenId}`);
          
           
            setTimeout(() => {
                window.location.href = 'my-pets.html';
            }, 100);
           
        } catch (e) {
            console.error("Ошибка при создании питомца:", e);
            console.log("Ошибка: " + (e.message || e));
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
                    { trait_type: "Experience", value: 0 },
                    { trait_type: "Status", value: 0 }
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
            window.location.href = 'my-pets.html';
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
        chosenImage = petImages[index+1][0];
        localStorage.setItem("chosenImage", chosenImage);
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

                    age = metadata.attributes.find(attr => attr.trait_type === "Age")?.value ?? '—';
                    health = metadata.attributes.find(attr => attr.trait_type === "Health")?.value ?? '—';
                    experience = metadata.attributes.find(attr => attr.trait_type === "Experience")?.value ?? '—';
                    
                    const statusValue = metadata.attributes.find(attr => attr.trait_type === "Status")?.value;
                    const status = statePet[statusValue] || "—";
                    console.log(`Pet ${tokenId} - Age: ${age}, Health: ${health}, Experience: ${experience}`);
                   
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


    const findImageGroupIndex = (images, target) => {
        for (let i = 0; i < images.length; i++) {
            if (images[i].includes(target)) {
                return i;                       // индекс подмассива
            }
        }
        return -1; 
    };

    async function feedPet() {
        if (!tokenId) {
            alert("Сначала выберите питомца.");
            return;
        }
        try {
            const tx = await contract.feedPet(tokenId);
            await tx.wait();

          
            


           
            const flag = false;
            await updatePetStats(flag);
        }
        catch (e) {
            let errorMessage = "Ошибка при кормлении питомца.";

            
            const revertReason =
                e?.error?.reason ||
                e?.error?.revert?.args?.[0] ||
                e?.reason ||
                e?.revert?.args?.[0];

            if (revertReason) {
                if (revertReason.includes("Too early to feed again")) {
                    errorMessage = "⏳ Питомца можно кормить не чаще, чем раз в 2 минуты!";
                } else if (revertReason.includes("Pet is not active")) {
                    errorMessage = "💀 Питомец мёртв или неактивен. Возродите его.";
                } else {
                    errorMessage = "⚠️ " + revertReason;
                }
            } else if (e?.message) {
                errorMessage = "⚠️ " + e.message;
            }

            if (feedErrorEl) {
                feedErrorEl.textContent = errorMessage;
                feedErrorEl.classList.add("error-message");

                setTimeout(() => {
                    feedErrorEl.classList.add("hidden");
                }, 5000);

                
                feedErrorEl.classList.remove("hidden");
            }
        
        }
    }

    async function feedPetBonus() {
        if (!tokenId) {
            alert("Сначала выберите питомца.");
            return;
        }

        try {
            let value = ethers.parseEther(petPrice);
            console.log("Sending bonus feed with value:", value);
            const tx = await contract.feedPetBonus(tokenId, { value: value });

            await tx.wait();

            petName = await contract.getName(tokenId);
            health = await contract.getHealth(tokenId);
            experience = await contract.getPetExperience(tokenId);
            age = await contract.getAge(tokenId);
            status = await contract.getPetState(tokenId);
            

            const flag = true;

            await updatePetStats(flag);

            
        } catch (e) {
            alert("Ошибка при бонусном кормлении: " + e.message);
            let errorMessage = "Ошибка при бонусном кормлении питомца.";


            const revertReason =
                e?.error?.reason ||
                e?.error?.revert?.args?.[0] ||
                e?.reason ||
                e?.revert?.args?.[0];

            if (revertReason) {
                if (revertReason.includes("Too early to feed again")) {
                    errorMessage = "⏳ Питомца можно кормить не чаще, чем раз в 5 минут!";
                } else if (revertReason.includes("Pet is not active")) {
                    errorMessage = "💀 Питомец мёртв или неактивен. Возродите его.";
                } else {
                    errorMessage = "⚠️ " + revertReason;
                }
            } else if (e?.message) {
                errorMessage = "⚠️ " + e.message;
            }

            if (feedErrorEl) {
                feedErrorEl.textContent = errorMessage;
                feedErrorEl.classList.add("error-message");

                setTimeout(() => {
                    feedErrorEl.classList.add("hidden");
                }, 5000);


                feedErrorEl.classList.remove("hidden");
            }
        }
    }



    async function updatePetStats(bool flag) {                       // функция - обновление состояния питомца (здоровье и опыт) каждые 3 минуты

        if (!tokenId) return;
        console.log("updatePetStats begin");
        try {
            petName = await contract.getName(tokenId);
            health = await contract.getHealth(tokenId);
            experience = await contract.getPetExperience(tokenId);
            age = await contract.getAge(tokenId);
            petStatus = await contract.getPetState(tokenId);

            let tokenURI = await contract.tokenURI(tokenId);
            let response = await fetch(tokenURI);
            let metadata = await response.json();

            const imageToFind = metadata.image;
            console.log("Image URL:", imageToFind);

            const groupIndex = findImageGroupIndex(petImages, imageToFind);

            if (groupIndex !== -1) {
                console.log(`Изображение найдено в подмассиве №${groupIndex}`);
            } else {
                console.log("Изображение не найдено в массиве.");
            }


            const chosenImage = petImages[groupIndex][age];
            if (petImageEl) {
                petImageEl.src = chosenImage;
                petImageEl.alt = petName;
            }
            if (flag) {
                alert(`🐾Вы покормили питомца бонусом!\nЗдоровье: ${health}\nОпыт: ${experience}\nstatus: ${status}`);
            } else {
                alert(`🐾 Питомец покормлен!\nЗдоровье: ${health}\nОпыт: ${experience}\nstatus: ${status}`);
            }
          
            console.log(`Pet ${tokenId} - Age: ${age}, Health: ${health}, Experience: ${experience}\nstatus: ${status}`);


            const newMetadata = {
                name: petName,
                description: `This is ${petName}, your new NFT pet!`,
                image: chosenImage,
                attributes: [
                    { trait_type: "Age", value: Number(age) },
                    { trait_type: "Health", value: Number(health) },
                    { trait_type: "Experience", value: Number(experience) },
                    { trait_type: "Status", value: Number(petStatus) }
                ]
            };


            let newTokenURI = await uploadMetadataToPinata(newMetadata);
            console.log("New Token URI:", newTokenURI);
            await contract.updateTokenURI(tokenId, newTokenURI);

            let totalExperience = await contract.getPetExperience(tokenId);
            if (experienceEl) experienceEl.textContent = ` ${totalExperience}`;




            if (lastFed) {
                lastFedEl.textContent = ` ${formatted}`;
                console.log("Last fed updated:", formatted);
            }




            await contract.decayExperience(tokenId);
            
        
         

            console.log(`🔁 Обновление данных ${name}: здоровье: ${health}, опыт: ${experience},status:${petStatus} `);

            status = petStatus === 0n ? "Active" : "Dead";
            console.log("updatePetStats update");
            
            
            if (nameEl) nameEl.textContent = petName;
            if (healthEl) healthEl.textContent = `${health}`;
            if (lastFed) lastFedEl.textContent = ` ${formatted}`;
            if (experienceEl) experienceEl.textContent = ` ${experience}`;
            if (ageEl) ageEl.textContent = ` ${age}`;
            if (statusEl) statusEl.textContent = ` ${status}`;
            console.log("updatePetStats end");
        } catch (e) {
            console.error("Ошибка при обновлении состояния питомца:", e.message);
        }
    }


   
    async function sellPet() {                     // Продать питомца другому адресу
         
            const toAddress = inputSellAddress.value.trim();
            const value = inputSellPrice.value.trim();
            const price = value ? ethers.parseEther(value) : ethers.parseEther(petPrice);
            
            if (!toAddress || !ethers.utils.isAddress(toAddress)) {
                alert("Неверный адрес Ethereum-кошелька.");
                return;
            }

            try {
                const tx = await contract.sellPet(selectedTokenId, toAddress);
                await tx.wait();

                alert("Питомец успешно продан!");

                
                inputSellAddress.value = "";
                await loadMyPets();
            } catch (e) {
                console.error("Ошибка при продаже:", e);
                alert("Ошибка при продаже: " + (e?.message || "Неизвестная ошибка"));
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
            console.log("price:", price);
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
            console.log("price:", price);
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

        tokenId = getTokenIdFromURL();
        console.log("TokenId from URL:", tokenId);
        if (!tokenId) {
            console.error("tokenId не найден в URL");
            return;
        }

        try {
            //debugger;
            [name, health, lastFed, experience, age, status] = await getPetStatus(tokenId);
            
            petStatus = await contract.getPetState(tokenId);
            status = petStatus === 0n ? "Active" : "Dead";
            if(petStatus != 0n){
                feedPetBtn.classList.add('non-display');
                sellPetBtn.classList.add('non-display');
                feedPetBonusBtn.classList.add('non-display');
                burnPetBtn.classList.remove('non-display');
            }
            
            console.log(`Pet ${tokenId} - Name: ${name}, Age: ${age}, Health: ${health}, Experience: ${experience}, Status: ${petStatus}`);



           

            const tokenURI = await contract.tokenURI(tokenId);
            const response = await fetch(tokenURI);
            const metadata = await response.json();
            
            if (nameEl) nameEl.textContent = name;
            if (healthEl) healthEl.textContent = ` ${health}`;
            if (lastFedEl) lastFedEl.textContent = ` ${formatted}`;
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
            

            const imageKeys = [
                "shopImage1",
                "shopImage2",
                "shopImage3",
                "shopImage4",
                "shopImage5",
                "shopImage6"
            ];

  
            const allCached = imageKeys.every(key => localStorage.getItem(key) !== null);

            let shopImages = [];

            if (allCached) {
                shopImages = imageKeys.map(key => localStorage.getItem(key));
            } else {
                shopImages = [
                    petImages[1][0],
                    petImages[2][0],
                    petImages[3][0],
                    petImages[4][0],
                    petImages[5][0],
                    petImages[6][0],
                ];

                shopImages.forEach((url, index) => {
                    localStorage.setItem(`shopImage${index + 1}`, url);
                });
            }

            
            shopImages.forEach((url, index) => {
                const card = document.createElement("div");
                card.className = "image-card";

                const img = document.createElement("img");
                img.src = url;
                img.alt = `Изображение ${index + 1}`;

                const price = document.createElement("div");
                price.textContent = petPrice + " ETH";

                const button = document.createElement("button");
                button.textContent = "Выбрать";
                button.classList.add("select-btn", "button-medium");

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
        petBonusFeedPrice = await getBONUS_FEED_PRICE();

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