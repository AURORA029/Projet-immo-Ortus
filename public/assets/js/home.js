/* HOME.JS
 * Gestion de l'affichage des biens à la une sur la page d'accueil.
 * Récupère les données depuis Google Sheets et génère les cartes HTML.
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";

document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedProperties();
});

/**
 * Récupère les données CSV, les convertit en JSON et affiche les 3 derniers biens.
 */
async function fetchFeaturedProperties() {
    const container = document.getElementById('featured-container');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const allProperties = csvToJSON(data); 
        
        // Sélection des 3 derniers biens ajoutés (ordre chronologique inverse)
        const featured = allProperties.reverse().slice(0, 3);

        container.innerHTML = ''; 

        featured.forEach((property, index) => {
            const card = createPropertyCard(property, index);
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des biens :", error);
        container.innerHTML = '<p style="color:#666; text-align:center; padding:20px;">Chargement du catalogue en cours...</p>';
    }
}

/**
 * Crée l'élément HTML pour une carte de bien immobilier.
 * @param {Object} p - Les données du bien.
 * @param {number} index - L'index pour le délai d'animation.
 * @returns {HTMLElement} - La carte DOM construite.
 */
function createPropertyCard(p, index) {
    const card = document.createElement('div');
    card.className = 'property-card';
    
    // Calcul du délai pour l'animation en cascade
    const delay = index * 150;
    
    // Style de la carte (Fond blanc standardisé)
    card.style.cssText = `
        background-color: #FFFFFF !important; 
        border: 1px solid #ddd !important; 
        border-radius: 12px; 
        overflow: hidden; 
        margin-bottom: 25px; 
        position: relative;
        opacity: 0;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        animation: fadeUp 0.8s ease-out ${delay}ms forwards;
    `;
    
    // 1. Gestion du Badge Prestige
    let badgePrestige = '';
    if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
        badgePrestige = `<span style="position:absolute; top:15px; left:15px; background:#D4AF37; color:black; padding:6px 12px; font-weight:800; font-size:0.75rem; border-radius:4px; z-index:10; box-shadow: 0 2px 5px rgba(0,0,0,0.3); letter-spacing:1px;">PRESTIGE</span>`;
    }

    // 2. Gestion du Badge Type (Vente/Location)
    let typeAction = "VENTE";
    const categorieBien = (p.categorie || "").toLowerCase();
    
    if (categorieBien.includes('loc')) {
        typeAction = "LOCATION";
    }

    const badgeStatus = `<span class="badge-status" style="position: absolute; top: 15px; right: 15px; background-color: #000; color: #fff !important; border: 1px solid #D4AF37; padding: 5px 10px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; border-radius: 4px; z-index: 10;">${typeAction}</span>`;

    // 3. Indicateur de popularité (Simulation temps réel)
    const viewers = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
    const popularityTag = `
        <div style="position:absolute; bottom:10px; right:10px; background:rgba(220, 20, 60, 0.95); color:white; font-size:0.75rem; padding:6px 12px; border-radius:20px; display:flex; align-items:center; gap:6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index:10; font-weight:700;">
            <span style="width:8px; height:8px; background:white; border-radius:50%; animation: pulse 1.5s infinite;"></span>
            ${viewers} intéressés
        </div>
    `;

    // 4. Caractéristiques principales (Pièces / Surface)
    let specsHTML = `
        <div style="display:flex; gap:20px; margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #eee; color:#444;">
            <span title="Pièces"><i class="fas fa-door-open" style="color:#D4AF37;"></i> ${p.pieces || p.lits || '?'} p.</span>
            <span title="Surface"><i class="fas fa-ruler-combined" style="color:#D4AF37;"></i> ${p.surface} m²</span>
        </div>
    `;

    // 5. Liste des atouts (Limité aux 3 premiers)
    let featuresList = '';
    if (p.caracteristiques) {
        let cleanFeat = p.caracteristiques.replace(/\n/g, ',');
        const feats = cleanFeat.split(',').slice(0, 3); 
        
        const listItems = feats.map(f => 
            `<li style="color: #555; margin-bottom: 6px; display:flex; align-items:center; font-size:0.85rem;">
                <i class="fas fa-check" style="color:#D4AF37; margin-right:8px; font-size:0.7rem;"></i> ${f.trim()}
            </li>`
        ).join('');
        
        featuresList = `<ul style="list-style:none; padding:0; margin-bottom:20px;">${listItems}</ul>`;
    }

    // Construction du HTML interne de la carte
    // MODIFICATION : Retrait de 'font-family: Playfair Display' sur le prix pour utiliser la police système (comme listing.js)
    card.innerHTML = `
        <div class="property-image" style="height:250px; position:relative; overflow:hidden;">
            ${badgePrestige}
            ${badgeStatus}
            ${typeAction === 'VENTE' ? popularityTag : ''} 
            <a href="detail.html?id=${p.id}">
                <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='assets/images/default.jpg'">
            </a>
        </div>
        
        <div class="property-details" style="padding: 25px;">
            <h3 style="margin-top:0; margin-bottom:8px;">
                <a href="detail.html?id=${p.id}" style="text-decoration:none; color: #111 !important; font-family:'Playfair Display', serif; font-size:1.4rem; display:block;">${p.titre}</a>
            </h3>
            
            <p style="color: #666 !important; font-size:0.9rem; margin-bottom:15px; display:flex; align-items:center;">
                <i class="fas fa-map-marker-alt" style="color:#D4AF37 !important; margin-right:8px;"></i> 
                ${p.ville}
            </p>
            
            ${specsHTML}
            
            <div style="color: #D4AF37; font-weight:800; font-size:1.5rem; margin-bottom:15px;">
                ${p.prix}
            </div>

            ${featuresList}
            
            <div style="display:flex; gap:10px;">
                <a href="detail.html?id=${p.id}" style="flex:1; text-align:center; padding:12px; background:white; border:1px solid #111; color:#111; text-decoration:none; font-weight:bold; font-size:0.9rem; transition:0.3s; border-radius:4px;" onmouseover="this.style.background='#111'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#111'">
                    Voir détails
                </a>
                <a href="detail.html?id=${p.id}#contact-form" style="flex:1; text-align:center; padding:12px; background:#D4AF37; color:black; border:none; font-weight:bold; font-size:0.9rem; border-radius:4px; text-decoration:none;">
                    Contact
                </a>
            </div>
        </div>
    `;

    return card;
}

/**
 * Fonction utilitaire pour convertir le CSV en JSON.
 */
function csvToJSON(csvText) {
    const lines = [];
    let newLine = '';
    let inQuote = false;
    for (let i = 0; i < csvText.length; i++) {
        let char = csvText[i];
        if (char === '"') inQuote = !inQuote;
        if (char === '\n' && !inQuote) { lines.push(newLine); newLine = ''; } 
        else { newLine += char; }
    }
    if (newLine) lines.push(newLine);
    if (lines.length < 2) return []; 
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
        const values = [];
        let currentVal = '';
        let inQuoteVal = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') { inQuoteVal = !inQuoteVal; continue; }
            if (char === ',' && !inQuoteVal) { values.push(currentVal.trim()); currentVal = ''; } 
            else { currentVal += char; }
        }
        values.push(currentVal.trim());
        let obj = {};
        headers.forEach((header, i) => { obj[header] = values[i] || ''; });
        return obj;
    });
}
