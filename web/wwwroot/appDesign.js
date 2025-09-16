// JavaScript source code
(async function () {

    document.addEventListener('DOMContentLoaded', function () {
        const defaultImage = "https://gateway.pinata.cloud/ipfs/bafkreiesrks5z3a4rkskyr7hmqmay7woqxnu76e57sc5sdat2kuq2h57zm";

        const avatarImg = document.getElementById('petAvatarSelect');
        const loader = document.getElementById('avatarLoader');
        if (!loader || !avatarImg) return;
        loader.style.display = 'block';
        avatarImg.style.display = 'none';

        avatarImg.src = defaultImage;

        avatarImg.addEventListener('load', () => {
            loader.style.display = 'none';
            avatarImg.style.display = 'block';
        });

        avatarImg.addEventListener('error', () => {
            loader.style.display = 'none';
            avatarImg.alt = 'Ошибка загрузки аватара';
            avatarImg.style.display = 'block';
        });
    });


    
    

})();