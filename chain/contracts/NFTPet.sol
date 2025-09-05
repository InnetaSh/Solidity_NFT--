// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTPet is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint constant MAX_HEALTH = 100;           // max здоровье 
    uint constant HEALTH_DECAY_PER_DAY = 10;  //питомец теряет 10 единиц здоровья за день если не кормить
    uint constant FEED_AMOUNT = 30;           //Кормление - +30HEALTH
    uint constant EVOLUTION_DAYS = 7;         //эволюционировать через 7 дней
    uint constant SECONDS_PER_DAY = 86400;

    enum PetState { Active, Evolved, Dead }

    struct Pet {
        string name;                    //имя
        uint health;                    //текущее здоровье;
        uint lastFed;                    //когда последний раз кормили
        uint createdAt;                  //дата создания
        uint evolveStage;                //стадия эволюции
        PetState state;                  //активный, эволюционировал или мертвый
    }

    mapping(uint => Pet) public pets;


    event EvolutionStage(uint tokenId, uintevolveStage);

    modifier onlyOwner(){
        require(msg.sender == owner, "Not your pet");
        _;
    }

    constructor() ERC721("NFTPets", "PET") {}

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
            evolveStage: 1,
            state: PetState.Active
        });
    }


    function getHealth(uint tokenId) public view returns (uint) {
        Pet memory pet = pets[tokenId];
        if (pet.state == PetState.Dead) return 0;

        uint timePassed = block.timestamp - pet.lastFed;
        uint decay = (timePassed / SECONDS_PER_DAY) * HEALTH_DECAY_PER_DAY;

        if (decay >= pet.health) {
            return 0;
        } else {
            return pet.health - decay;
        }
    }


    function feedPet(uint tokenId) public onlyOwner(){
        Pet storage pet = pets[tokenId];
        require(pet.state == PetState.Active, "Pet is not active");

        uint currentHealth = getHealth(tokenId);

        if (currentHealth == 0) {
            pet.health = 0;
            pet.state = PetState.Dead;
        } else {
            pet.health = currentHealth + FEED_AMOUNT;
            if (pet.health > MAX_HEALTH) {
                pet.health = MAX_HEALTH;
            }
            pet.lastFed = block.timestamp;

            
            if (
                block.timestamp - pet.createdAt >= EVOLUTION_DAYS * SECONDS_PER_DAY &&
                pet.health == MAX_HEALTH
            ) {
                pet.evolveStage += 1;
                pet.state = PetState.Evolved;

                emit EvolutionStage(tokenId, pet.evolveStage);
            }
        }
    }

    function updateTokenURI(uint tokenId, string memory tokenURI) public{
        _setTokenURI(tokenId, tokenURI);
    }


    function burnDeadPet(uint tokenId) public onlyOwner(){
        require(pets[tokenId].state == PetState.Dead, "Pet is not dead");

        _burn(tokenId);
        delete pets[tokenId];
    }

    function getPetStatus(uint tokenId) public view returns (
        string memory name,
        uint health,
        uint lastFed,
        uint evolveStage,
        PetState state
    ) {
        Pet memory pet = pets[tokenId];
        uint currentHealth = getHealth(tokenId);

        if (currentHealth == 0 && pet.state != PetState.Dead) {
            return (pet.name, 0, pet.lastFed, pet.evolveStage, PetState.Dead);
        }

        return (pet.name, currentHealth, pet.lastFed, pet.evolveStage, pet.state);
    }


    function getName(uint tokenId) public returns(string memory){
        return pets[tokenId].name;
    }


    function getPetState(uint tokenId) public returns(PetState memory){
        return pets[tokenId].state;
    }
       
   
    function getEvolutionStage(uint tokenId) public returns(uint){
        return pets[tokenId].evolveStage;
    }




}
