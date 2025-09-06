// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTPet is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint constant MAX_HEALTH = 100;           // max здоровье 
    uint constant HEALTH_DECAY_PER_DAY = 10;  //питомец теряет 10 единиц здоровья за день если не кормить
    uint constant FEED_AMOUNT = 30;           //Кормление - +30HEALTH
    uint constant EVOLUTION_DAYS = 7;         //эволюционировать через 7 дней
    uint constant SECONDS_PER_DAY = 86400;


    uint public  PET_PRICE = 0.01 ether;
    uint public  BONUS_FEED_PRICE = 0.005 ether;

    enum PetState { Active, Dead }
    uint[] public experienceThresholds = [0, 20, 70, 150, 250, 370, 500, 650, 730, 1000];

    struct Pet {
        string name;                    //имя
        uint health;                    //текущее здоровье;
        uint lastFed;                   //когда последний раз кормили
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
    event PetCreated(uint tokenId, address petOwner);

    modifier onlyPetOwner(uint tokenId) {
        require(ownerOf(tokenId) ==  msg.sender, "Not your pet");
        _;
    }

    
    constructor() ERC721("NFTPets", "PET") {
    }

    function mintPet(string memory name, string memory tokenURI) public {
        _tokenIds.increment();
        uint256 newPetId = _tokenIds.current();
        _safeMint(msg.sender, newPetId);    // Создаём NFT и передаём владельцу
        _setTokenURI(newPetId, tokenURI);   // Привязываем метаданные (ссылку)

        pets[newPetId] = Pet({
            name: name,
            health: MAX_HEALTH,
            lastFed: block.timestamp,
            createdAt: block.timestamp,
            age:0,
            experience:0,
            state: PetState.Active
        });

        userPets[msg.sender].push(newPetId);
    }


    function getPet(string memory name, string memory tokenURI) public payable {
        uint256 ownedPetsCount = userPets[msg.sender].length;

        if (ownedPetsCount == 0) {
            mintPet(name, tokenURI);
            uint256 newPetId = _tokenIds.current();
            emit PetCreated(newPetId, msg.sender);
        } else {
            require(msg.value >= PET_PRICE, "Not enough ETH to buy pet");
            mintPet(name, tokenURI);
            uint256 newPetId = _tokenIds.current();

            emit PetCreated(newPetId, msg.sender);
        }
    }


    function sellPet(uint256 tokenId, address to) public onlyPetOwner(tokenId) {
        require(pets[tokenId].state != PetState.Dead, "Cannot sell dead pet");
        safeTransferFrom(msg.sender, to, tokenId);

        _removePetFromUser(msg.sender, tokenId);
        userPets[to].push(tokenId);
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

        uint timePassed = block.timestamp - pet.lastFed;
        uint decay = (timePassed / SECONDS_PER_DAY) * HEALTH_DECAY_PER_DAY;

        if (decay >=  pets[tokenId].health) {
            return 0;
        } else {
            return  pets[tokenId].health - decay;
        }
    }


    function feedPet(uint tokenId) public onlyPetOwner(tokenId){
        Pet memory pet = pets[tokenId];

        require(block.timestamp - pet.lastFed >= 300, "Too early to feed again");
        require(pet.state == PetState.Active, "Pet is not active");

        uint currentHealth = getHealth(tokenId);

        if (currentHealth == 0) {
            pet.health = 0;
            pet.state = PetState.Dead;
            emit PetDied(tokenId);
        } else {
            pet.health = currentHealth + FEED_AMOUNT;
            if (pet.health > MAX_HEALTH) {
                pet.health = MAX_HEALTH;
            }
            pet.lastFed = block.timestamp;

            pet.experience += 10;
            
            for (uint i = experienceThresholds.length - 1; i > pet.age; i--) {
                if (pet.experience >= experienceThresholds[i]) {
                    pet.age = i;
                    emit EvolutionStage(tokenId, pet.age);
                    break;
                }
            }
            emit PetFed(tokenId, pet.health);
        }

    }

    function feedPetBonus(uint tokenId) public payable  onlyPetOwner(tokenId) {
        Pet memory pet = pets[tokenId];

        require(block.timestamp - pet.lastFed >= 3600, "Too early to feed again");
        require(msg.value >= BONUS_FEED_PRICE, "Not enough ETH for bonus feed");
        require(pet.state == PetState.Active, "Pet is not active");

        pet.health = MAX_HEALTH;
        pet.lastFed = block.timestamp;

         pet.experience += 25;

        emit PetFed(tokenId, pet.health);

        if(msg.value > BONUS_FEED_PRICE) {
            payable(msg.sender).transfer(msg.value - BONUS_FEED_PRICE);
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

    function getPetStatus(uint tokenId) public view returns (
        string memory name,
        uint health,
        uint lastFed,
        uint age,
        PetState state
    ) {
        Pet memory pet = pets[tokenId];
        uint currentHealth = getHealth(tokenId);

        if (currentHealth == 0 && pet.state != PetState.Dead) {
            return (pet.name, 0, pet.lastFed, pet.age, PetState.Dead);
        }

        return (pet.name, currentHealth, pet.lastFed, pet.age, pet.state);
    }

    function setPET_PRICE(uint _price) public {
        PET_PRICE = _price;
    }

      function setBONUS_FEED_PRICE(uint  _price) public{
        BONUS_FEED_PRICE = _price;
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


    function getName(uint tokenId) public view  returns(string memory){
        return pets[tokenId].name;
    }


    function getPetState(uint tokenId) public view  returns(PetState){
        return pets[tokenId].state;
    }
       
   
    function getAge(uint tokenId) public view returns(uint){
        return pets[tokenId].age;
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

    function getMyPets() public view returns (uint256[] memory) {
        return userPets[msg.sender];
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

}
