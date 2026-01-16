// 1. On récupère le paramètre "filtre" dans l'URL
const params = new URLSearchParams(window.location.search);
const filtre = params.get('filtre'); // peut être "vente", "location" ou "all"

const container = document.getElementById('listing-container');
const titleElement = document.getElementById('page-title');

// 2. On filtre les données
let biensAffiche = [];

if (filtre === 'vente') {
    titleElement.innerText = "Acheter un bien";
    // On garde uniquement ceux qui ont le badge "Vente"
    biensAffiche = biensImmobiliers.filter(b => b.badge === "Vente");
} 
else if (filtre === 'location') {
    titleElement.innerText = "Louer un bien";
    // On garde uniquement ceux qui ont le badge "Location"
    biensAffiche = biensImmobiliers.filter(b => b.badge === "Location");
} 
else {
    // Par défaut (ou si filtre=all), on montre tout
    titleElement.innerText = "Tous nos biens immobiliers";
    biensAffiche = biensImmobiliers;
}

// 3. On génère le HTML (Même logique que l'accueil)
container.innerHTML = ''; // On vide le "Chargement..."

if (biensAffiche.length === 0) {
    container.innerHTML = '<h3 style="color:white;">Aucun bien ne correspond à cette catégorie pour le moment.</h3>';
} else {
    biensAffiche.forEach(bien => {
        // Choix couleur badge
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
