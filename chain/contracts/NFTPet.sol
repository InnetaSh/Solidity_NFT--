// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTPet is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint constant MAX_HEALTH = 100;
    uint constant HEALTH_DECAY_PER_DAY = 10;
    uint constant FEED_AMOUNT = 30;
    uint constant EVOLUTION_DAYS = 7;
    uint constant SECONDS_PER_DAY = 86400;

    enum PetState { Active, Evolved, Dead }

    struct Pet {
        string name;       //имя
        uint health;       //текущее здоровье;
        uint lastFed;      //когда последний раз кормили
        uint createdAt;    //дата создания
        uint evolveStage;  //стадия эволюции
        PetState state;    //активный, эволюционировал или мертвый
    }

    mapping(uint => Pet) public pets;

    constructor() ERC721("NFTPets", "PET") {}


}
