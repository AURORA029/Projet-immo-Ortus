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
