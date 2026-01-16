// On attend que le DOM (la structure HTML) soit chargé
document.addEventListener('DOMContentLoaded', () => {
    
    // On récupère les éléments HTML
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-menu');

    // On écoute le clic sur le bouton burger
    mobileMenuBtn.addEventListener('click', () => {
        // On ajoute/enlève la classe 'active' au menu (pour le faire glisser)
        navList.classList.toggle('active');
        
        // On ajoute/enlève la classe 'active' au bouton (pour l'animation en croix)
        mobileMenuBtn.classList.toggle('active');
    });

    // Petit bonus UX : Fermer le menu si on clique sur un lien
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        navList.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    }));
});

/* --- GESTION DU TITRE DYNAMIQUE (RECHERCHE) --- */
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. On récupère les paramètres de l'URL (ex: ?ville=Mahajanga&type=Maison)
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const ville = urlParams.get('ville');
    const filtre = urlParams.get('filtre'); // Pour vente/location

    // 2. On cible le titre de la page (H2 dans section-title)
    const titleElement = document.querySelector('.section-title h2');
    const descElement = document.querySelector('.section-title p');

    // Sécurité : Si on n'est pas sur une page avec un titre, on ne fait rien
    if (!titleElement) return;

    // Fonction pour mettre la 1ère lettre en majuscule (plus joli)
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    // CAS A : L'utilisateur a fait une RECHERCHE précise
    if (type || ville) {
        let textResultat = "Résultats pour : ";

        if (type && ville) {
            // Ex: "Maison à Mahajanga"
            textResultat += `${capitalize(type)} à ${capitalize(ville)}`;
        } else if (type) {
            // Ex: "Terrain"
            textResultat += `${capitalize(type)}`;
        } else if (ville) {
            // Ex: "Biens à Mahajanga"
            textResultat += `Biens à ${capitalize(ville)}`;
        }

        // On remplace le texte "Tous nos biens" par la recherche
        titleElement.textContent = textResultat;
        
        // On change aussi la petite phrase en dessous
        if (descElement) {
            descElement.textContent = "Voici les opportunités correspondant à vos critères.";
        }
    }
    
    // CAS B : L'utilisateur a cliqué sur le MENU (Acheter / Louer)
    else if (filtre) {
        if (filtre === 'vente') {
            titleElement.textContent = "Nos biens à l'Achat";
        } else if (filtre === 'location') {
            titleElement.textContent = "Nos biens en Location";
        }
    }
});
