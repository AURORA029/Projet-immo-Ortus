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
    
    // 1. On récupère les infos
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const ville = urlParams.get('ville');
    const filtre = urlParams.get('filtre');

    // 2. CORRECTION ICI : On cible le bon ID de ton HTML (h1 id="page-title")
    const titleElement = document.getElementById('page-title');

    // Sécurité
    if (!titleElement) return;

    // Fonction Majuscule
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    // CAS A : Recherche
    if (type || ville) {
        let textResultat = "Résultats pour : ";

        if (type && ville) {
            textResultat += `${capitalize(type)} à ${capitalize(ville)}`;
        } else if (type) {
            textResultat += `${capitalize(type)}`;
        } else if (ville) {
            textResultat += `Biens à ${capitalize(ville)}`;
        }

        // On applique le texte
        titleElement.textContent = textResultat;
    }
    
    // CAS B : Filtre Menu
    else if (filtre) {
        if (filtre === 'vente') {
            titleElement.textContent = "Nos biens à l'Achat";
        } else if (filtre === 'location') {
            titleElement.textContent = "Nos biens en Location";
        }
    }
});

