// 1. On récupère TOUS les paramètres de l'URL
const params = new URLSearchParams(window.location.search);
const filtreMode = params.get('filtre'); // "vente" ou "location" (depuis le menu)
const rechercheVille = params.get('ville'); // (depuis la barre de recherche)
const rechercheType = params.get('type');   // (depuis la barre de recherche)

const container = document.getElementById('listing-container');
const titleElement = document.getElementById('page-title');

// 2. Fonction principale de filtrage
function filtrerBiens() {
    // Au début, on prend TOUS les biens
    let resultats = biensImmobiliers;

    // --- FILTRE 1 : Vente ou Location (via le Menu) ---
    if (filtreMode === 'vente') {
        titleElement.innerText = "Acheter un bien";
        resultats = resultats.filter(b => b.badge === "Vente");
    } 
    else if (filtreMode === 'location') {
        titleElement.innerText = "Louer un bien";
        resultats = resultats.filter(b => b.badge === "Location");
    }

    // --- FILTRE 2 : La Ville (via la Barre de recherche) ---
    if (rechercheVille) {
        // On met tout en minuscule pour comparer (ex: "Mahajanga" == "mahajanga")
        const villeClean = rechercheVille.toLowerCase().trim();
        if (villeClean !== "") {
            resultats = resultats.filter(b => b.ville.toLowerCase().includes(villeClean));
            titleElement.innerText = `Recherche : "${rechercheVille}"`;
        }
    }

    // --- FILTRE 3 : Le Type (Maison, Terrain...) ---
    if (rechercheType) {
        const typeClean = rechercheType.toLowerCase().trim();
        if (typeClean !== "") {
            // On regarde si le TITRE contient le mot (ex: "Maison" dans "Maison traditionnelle")
            resultats = resultats.filter(b => b.titre.toLowerCase().includes(typeClean));
        }
    }

    // 3. Affichage des résultats
    afficherResultats(resultats);
}

// Fonction pour générer le HTML (Même qu'avant, juste isolée pour être propre)
function afficherResultats(liste) {
    container.innerHTML = ''; // On vide

    if (liste.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:white; grid-column: 1/-1;">
                <h3 style="margin-bottom:10px;">Aucun résultat trouvé.</h3>
                <p>Essayez une autre recherche ou parcourez tous nos biens.</p>
                <a href="biens.html" class="btn-search" style="display:inline-block; margin-top:20px; text-decoration:none;">Tout voir</a>
            </div>
        `;
        return;
    }

    liste.forEach(bien => {
        const badgeClass = bien.badge === "Vente" ? "badge-sale" : "badge-rent";
        
        const carteHTML = `
            <article class="property-card">
                <div class="card-img-wrapper">
                    <span class="badge ${badgeClass}">${bien.badge}</span>
                    <img src="${bien.image}" alt="${bien.titre}" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-price">${bien.prix}</h3>
                    <h4 class="card-title">${bien.titre}</h4>
                    <p class="card-location"><i class="fas fa-map-marker-alt"></i> ${bien.ville}</p>
                    
                    <div class="card-details">
                        <span><i class="fas fa-bed"></i> ${bien.lits} Lits</span>
                        <span><i class="fas fa-bath"></i> ${bien.bains} SdB</span>
                        <span><i class="fas fa-ruler-combined"></i> ${bien.surface}</span>
                    </div>
                    
                    <a href="detail.html?id=${bien.id}" class="btn-card">Voir le bien</a>
                </div>
            </article>
        `;
        container.innerHTML += carteHTML;
    });
}

// On lance le moteur !
filtrerBiens();

