// 1. On récupère l'ID dans l'URL (ex: detail.html?id=1)
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// 2. On cherche le bien correspondant dans "datas.js"
// Le "==" permet de comparer un ID chiffre (1) avec un ID texte ("1") sans bug
const bien = biensImmobiliers.find(b => b.id == id);

// 3. Si on a trouvé le bien, on remplit la page
if (bien) {
    // --- A. REMPLISSAGE CLASSIQUE (Ce que tu avais déjà) ---
    const elTitle = document.getElementById('detail-title');
    if(elTitle) elTitle.innerText = bien.titre;

    const elPrice = document.getElementById('detail-price');
    if(elPrice) elPrice.innerText = bien.prix;

    const elLoc = document.getElementById('detail-location');
    if(elLoc) elLoc.innerText = bien.ville;
    
    // Infos techniques (Lits, Bains, Surface)
    const elLits = document.getElementById('detail-lits');
    if(elLits) elLits.innerText = bien.lits + ' Lits';

    const elBains = document.getElementById('detail-bains');
    if(elBains) elBains.innerText = bien.bains + ' SdB';

    const elSurf = document.getElementById('detail-surface');
    if(elSurf) elSurf.innerText = bien.surface;

    // Image & Description
    const elImg = document.getElementById('detail-image');
    if(elImg) {
        elImg.src = bien.image;
        elImg.alt = bien.titre;
    }

    const elDesc = document.getElementById('detail-description');
    if(elDesc) elDesc.innerHTML = bien.description;

    // Badge Vente/Location
    const badge = document.getElementById('detail-badge');
    if (badge) {
        badge.innerText = bien.badge;
        if (bien.badge === "Vente") {
            badge.className = "badge badge-sale";
        } else {
            badge.className = "badge badge-rent";
        }
    }

    // --- B. NOUVEAU : GESTION DES CARACTÉRISTIQUES (La boucle) ---
    const containerCarac = document.getElementById('features-container');
    
    // On vérifie que la boîte existe ET que le bien a des caractéristiques
    if (containerCarac && bien.caracteristiques) {
        containerCarac.innerHTML = ''; // On vide la liste par précaution

        // Pour chaque caractéristique (ex: "Piscine"), on crée une ligne
        bien.caracteristiques.forEach(carac => {
            const li = document.createElement('li');
            // On ajoute l'icône check bleue + le texte
            li.innerHTML = `<i class="fas fa-check"></i> ${carac}`;
            containerCarac.appendChild(li);
        });
    }

} else {
    // 4. Si l'ID n'existe pas
    document.body.innerHTML = "<div style='text-align:center; padding:50px; color:white;'><h1>Oups ! Ce bien n'existe pas.</h1><a href='index.html' style='color:#c5a065'>Retour à l'accueil</a></div>";
}
