// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTPet is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;


    uint constant MAX_SATIETY = 100;
    uint constant SATIETY_DECAY_INTERVAL = 120; // 2 минуты
    uint constant SATIETY_DECAY_AMOUNT = 1;

   
    uint constant MAX_HEALTH = 100;                      // max здоровье 
    uint constant HEALTH_DECAY_PERCENT = 10;            // уменьшается на 10% каждые 10 мин
    uint constant HEALTH_DECAY_MIN_INTERVAL = 600;      // каждые 10 минут уменьшается здоровье 
    uint public HEAL_PRICE = 0.005 ether;


   
    uint constant SECONDS_PER_DAY = 86400;


    uint public  PET_PRICE = 0.01 ether;
    uint public  BONUS_FEED_PRICE = 0.005 ether;

    enum PetState { Active, Dead }
    uint[] public experienceThresholds = [0, 20, 70, 150, 250, 370, 500, 650, 730, 1000];

    struct Pet {
        string name;                    //имя
        uint satiety;                 //текущая степень голодности(сытости);
        uint health;                    //текущее здоровье;
        uint lastFed;                   //когда последний раз кормили
        uint lastHealthDecay;           //когда последний раз лечили
        uint createdAt;                 //дата создания
        uint age;                       //возраст
        uint experience;                // очки опыта
        PetState state;                 //активный или мертвый
    }

    mapping(uint => Pet) public pets;
    mapping(address => uint256[]) public userPets;


    event EvolutionStage(uint tokenId, uint age);
    event PetFed(uint tokenId, uint newHealth);
    event PetDied(uint tokenId);
    event PetCreated(uint256 indexed tokenId, address indexed owner);
    event PetSold(uint tokenId, address from, address to);

    modifier onlyPetOwner(uint tokenId) {
        require(ownerOf(tokenId) ==  msg.sender, "Not your pet");
        _;
    }

    
    constructor() ERC721("NFTPets", "PET") {
    }

    function mintPet(string memory name, string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newPetId = _tokenIds.current();
        _safeMint(msg.sender, newPetId);    // Создаём NFT и передаём владельцу
        _setTokenURI(newPetId, tokenURI);   // Привязываем метаданные (ссылку)

       pets[newPetId] = Pet({
            name: name,
            satiety: MAX_SATIETY,
            health: MAX_HEALTH,
            lastFed: block.timestamp,
            lastHealthDecay: block.timestamp,
            createdAt: block.timestamp,
            age: 0,
            experience: 0,
            state: PetState.Active
        });


        userPets[msg.sender].push(newPetId);

            return newPetId;
    }


    function getPet(string memory name, string memory tokenURI) public payable {
        uint256 ownedPetsCount = userPets[msg.sender].length;

        if (ownedPetsCount == 0) {
            uint256 newPetId = mintPet(name, tokenURI);
            emit PetCreated(newPetId, msg.sender);
        } else {
            require(msg.value >= PET_PRICE, "Not enough ETH to buy pet");
           uint256 newPetId = mintPet(name, tokenURI);
           emit PetCreated(newPetId, msg.sender);
        }
    }


    function sellPet(uint256 tokenId, address to) public onlyPetOwner(tokenId) {
        require(pets[tokenId].state != PetState.Dead, "Cannot sell dead pet");
        safeTransferFrom(msg.sender, to, tokenId);

        _removePetFromUser(msg.sender, tokenId);
        userPets[to].push(tokenId);

        emit PetSold(tokenId, msg.sender, to);
    }

    function _removePetFromUser(address petOwner, uint256 tokenId) internal {
        uint256[] storage petsArray = userPets[petOwner];
        for (uint i = 0; i < petsArray.length; i++) {
            if (petsArray[i] == tokenId) {
                petsArray[i] = petsArray[petsArray.length - 1];
                petsArray.pop();
                break;
            }
        }
    }

    function getHealth(uint tokenId) public view returns (uint) {
        require(_exists(tokenId), "Pet does not exist");
        Pet memory pet = pets[tokenId];
        if (pet.state == PetState.Dead) return 0;

        uint timePassed = block.timestamp - pet.lastHealthDecay;

        // каждое 10-15 мин уменьшает на 10%
        uint numDecays = timePassed / HEALTH_DECAY_MIN_INTERVAL;

        uint healthLoss = numDecays * HEALTH_DECAY_PERCENT;

        if (healthLoss >= pet.health) return 0;
        return pet.health - healthLoss;
    }

    function getSatiety(uint tokenId) public view returns (uint) {
        require(_exists(tokenId), "Pet does not exist");
        Pet memory pet = pets[tokenId];
        if (pet.state == PetState.Dead) return 0;

        uint timePassed = block.timestamp - pet.lastFed;
        uint decayUnits = timePassed / SATIETY_DECAY_INTERVAL;
        uint decay = decayUnits * SATIETY_DECAY_AMOUNT;

        if (decay >= pet.satiety) return 0;
        return pet.satiety - decay;
    }



    function feedPet(uint tokenId) public onlyPetOwner(tokenId){
        Pet storage  pet = pets[tokenId];

        
       // require(pet.experience == 0 || block.timestamp - pet.lastFed >= 120, "Too early to feed again");
        require(pet.state == PetState.Active, "Pet is not active");
        require(getSatiety(tokenId) < MAX_SATIETY, "Pet is already full");
        require(getHealth(tokenId) < MAX_HEALTH, "Pet is already healthy");

        uint currentSatiety = getSatiety(tokenId);
        uint currentHealth = getHealth(tokenId);

        if (currentSatiety == 0 || currentHealth == 0) {
            pet.satiety = 0;
            pet.health = currentHealth;
            pet.state = PetState.Dead;
            emit PetDied(tokenId);
             return; 
        } else {
            pet.satiety = MAX_SATIETY;
            pet.lastFed = block.timestamp;

            pet.health = currentHealth; // Обновить здоровье
            pet.lastHealthDecay = block.timestamp;

            pet.experience += 10;

            for (uint i = experienceThresholds.length - 1; i > pet.age; i--) {
                if (pet.experience >= experienceThresholds[i]) {
                    pet.age = i;
                    emit EvolutionStage(tokenId, pet.age);
                    break;
                }
            }

            emit PetFed(tokenId, pet.satiety);
        }
    }


    function feedPetBonus(uint tokenId) public payable  onlyPetOwner(tokenId) {
        Pet storage  pet = pets[tokenId];

       // require(pet.experience == 0 || block.timestamp - pet.lastFed >= 300, "Too early to feed again");
        require(msg.value >= BONUS_FEED_PRICE, "Not enough ETH for bonus feed");
        require(getSatiety(tokenId) < MAX_SATIETY, "Pet is already full");
        require(getHealth(tokenId) < MAX_HEALTH, "Pet is already healthy");
        require(pet.state == PetState.Active, "Pet is not active");

        pet.health = MAX_HEALTH;
        pet.lastFed = block.timestamp;

         pet.experience += 25;

          for (uint i = experienceThresholds.length - 1; i > pet.age; i--) {
                if (pet.experience >= experienceThresholds[i]) {
                    pet.age = i;
                    emit EvolutionStage(tokenId, pet.age);
                    break;
                }
            }

        emit PetFed(tokenId, pet.health);

        if(msg.value > BONUS_FEED_PRICE) {
            payable(msg.sender).transfer(msg.value - BONUS_FEED_PRICE);
        }
    }

    function healPet(uint tokenId) public payable onlyPetOwner(tokenId) {
        Pet storage pet = pets[tokenId];
        require(pet.state == PetState.Active, "Pet is not active");
        require(msg.value >= HEAL_PRICE, "Not enough ETH to heal");

        uint currentHealth = getHealth(tokenId);
        require(currentHealth < MAX_HEALTH, "Already at full health");

        pet.health = MAX_HEALTH;
        pet.lastHealthDecay = block.timestamp;

        if (msg.value > HEAL_PRICE) {
            payable(msg.sender).transfer(msg.value - HEAL_PRICE); // возврат лишнего
        }
    }

    

    function decayExperience(uint tokenId) public {
        Pet storage pet = pets[tokenId];
        require(pet.state == PetState.Active, "Pet is not active");

        uint timePassed = block.timestamp - pet.lastFed;

        uint daysMissed = timePassed / SECONDS_PER_DAY;
        uint decayAmount = daysMissed * 5;

        if (decayAmount > pet.experience) {
            pet.experience = 0;
        } else {
            pet.experience -= decayAmount;
        }

    }

    function updateTokenURI(uint tokenId, string memory tokenURI) public onlyPetOwner(tokenId){
        _setTokenURI(tokenId, tokenURI);
    }


    function burnDeadPet(uint tokenId) public onlyPetOwner(tokenId){
        require(pets[tokenId].state == PetState.Dead, "Pet is not dead");

        _burn(tokenId);
        delete pets[tokenId];
    }

    function getPetInfo(uint tokenId) public view returns (
        string memory name,
        uint satiety,
        uint health,
        uint lastFed,
        uint lastHealthDecay,
        uint experience,
        uint age,
        uint8 state
    ) {
        Pet memory pet = pets[tokenId];

        uint currentSatiety = getSatiety(tokenId);
        uint currentHealth = getHealth(tokenId);

        if (currentSatiety == 0 || currentHealth == 0) {
            return (pet.name, 0, 0, pet.lastFed, pet.lastHealthDecay, pet.experience, pet.age, uint8(PetState.Dead));
        }

        return (
            pet.name,
            currentSatiety,
            currentHealth,
            pet.lastFed,
            pet.lastHealthDecay,
            pet.experience,
            pet.age,
            uint8(pet.state)
        );
    }



    function setPET_PRICE(uint _price) public onlyOwner {
        PET_PRICE = _price;
    }

      function setBONUS_FEED_PRICE(uint  _price) public onlyOwner {
        BONUS_FEED_PRICE = _price;
    }

    function setHEAL_PRICE(uint _price) public onlyOwner {
        HEAL_PRICE = _price;
    }


     function addExperienceThreshold(uint newThreshold) public onlyOwner {
        require(
            experienceThresholds.length == 0 || 
            newThreshold > experienceThresholds[experienceThresholds.length - 1],
            "New threshold must be greater than last"
        );
        experienceThresholds.push(newThreshold);
    }


    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getLastPetId(address owner) public view returns (uint256) {
        uint256[] memory petsOfUser = userPets[owner];
        if (petsOfUser.length == 0) return 0;
        return petsOfUser[petsOfUser.length - 1];
    }


    function getName(uint tokenId) public view  returns(string memory){
        return pets[tokenId].name;
    }


    function getPetState(uint tokenId) public view  returns(PetState){
        return pets[tokenId].state;
    }
       
   
    function getAge(uint tokenId) public view returns(uint){
        return pets[tokenId].age;
    }

    function getPetExperience(uint tokenId) public view returns (uint) {
        return pets[tokenId].experience;
    }

    function exists(uint tokenId) public view returns(bool) {
        return _exists(tokenId);
    }

    function getPET_PRICE() public view returns(uint){
        return PET_PRICE;
    }

     function getBONUS_FEED_PRICE() public view returns(uint){
        return BONUS_FEED_PRICE;
    }

    function getHEAL_PRICE() public view returns(uint){
		return HEAL_PRICE;
	}
    function getSATIETY_DECAY_INTERVAL() public pure returns(uint){
		return SATIETY_DECAY_INTERVAL;
	}

    function getSATIETY_DECAY_AMOUNT() public pure returns(uint){
    return SATIETY_DECAY_AMOUNT;
    }

    function getMyPets() public view returns (uint256[] memory) {
        return userPets[msg.sender];
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

}
