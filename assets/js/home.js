/* HOME.JS - VERSION FINALE (Cible la colonne 'categorie') 🎯
 * Génère les cartes de l'accueil avec les badges VENTE / LOCATION
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";

document.addEventListener('DOMContentLoaded', () => {
    fetchFeatured();
});

async function fetchFeatured() {
    const container = document.getElementById('featured-container');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const allProperties = csvToJSON(data); 
        const featured = allProperties.reverse().slice(0, 3);

        container.innerHTML = ''; 

        featured.forEach(p => {
            const card = document.createElement('div');
            card.className = 'property-card';
            
            // STYLE "FORCE BRUTE" (Fond Noir + Bordures)
            card.style.cssText = "background-color: #121212 !important; border: 1px solid #333 !important; border-radius: 8px; overflow: hidden; margin-bottom: 20px; position: relative;";
            
            // 1. BADGE PRESTIGE (En haut à GAUCHE)
            let badgePrestige = '';
            // On vérifie si la gamme contient 'prestige'
            if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
                badgePrestige = `<span style="position:absolute; top:10px; left:10px; background:#D4AF37; color:black; padding:5px 10px; font-weight:bold; font-size:0.8rem; z-index:10; border-radius:2px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">💎 PRESTIGE</span>`;
            }

            // 2. BADGE VENTE / LOCATION (En haut à DROITE)
            // CIBLAGE PRÉCIS : On regarde la colonne 'categorie'
            let typeAction = "VENTE"; // Valeur par défaut
            const categorieBien = (p.categorie || "").toLowerCase(); // On met en minuscule pour être sûr
            
            // Si le mot "loc" est dans la catégorie (ex: "Location", "Loc", "A louer")...
            if (categorieBien.includes('loc')) {
                typeAction = "LOCATION";
            }

            // Création du badge HTML
            const badgeStatus = `<span class="badge-status" style="position: absolute; top: 15px; right: 15px; background-color: #020610; color: #FFFFFF !important; border: 1px solid #D4AF37; padding: 5px 15px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; border-radius: 4px; z-index: 10; letter-spacing: 1px;">${typeAction}</span>`;

            // CONSTRUCTION DE LA CARTE HTML
            card.innerHTML = `
                <div class="property-image" style="height:250px; position:relative;">
                    ${badgePrestige}
                    ${badgeStatus} <a href="detail.html?id=${p.id}">
                        <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition:0.5s;" onerror="this.src='assets/images/default.jpg'">
                    </a>
                </div>
                
                <div class="property-details" style="padding: 20px;">
                    <h3 style="margin-top:0; margin-bottom:10px;">
                        <a href="detail.html?id=${p.id}" style="text-decoration:none; color: #FFFFFF !important; font-family:'Playfair Display', serif; font-size:1.3rem; display:block;">${p.titre}</a>
                    </h3>
                    
                    <p style="color: #E0E0E0 !important; font-size:0.95rem; margin-bottom:15px; display:flex; align-items:center;">
                        <i class="fas fa-map-marker-alt" style="color:#D4AF37 !important; margin-right:8px;"></i> 
                        <span style="color: #E0E0E0 !important;">${p.ville}</span>
                    </p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #333; padding-top:15px;">
                        <div class="price" style="color: #D4AF37 !important; font-weight:bold; font-size:1.2rem;">${p.prix}</div>
                        
                        <a href="detail.html?id=${p.id}" style="color: white !important; text-decoration:none; font-size:0.9rem; border:1px solid #555; padding:8px 15px; border-radius:50px; display:inline-block;">
                            Voir <i class="fas fa-arrow-right" style="font-size:0.8rem; margin-left:5px;"></i>
                        </a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; text-align:center;">Impossible de charger les biens.</p>';
    }
}

// Fonction utilitaire pour transformer le CSV en JSON
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
