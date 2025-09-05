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

}
