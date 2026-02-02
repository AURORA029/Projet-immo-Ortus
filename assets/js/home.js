/* HOME.JS - PROTOCOLE ZORG OMEGA
 * Génère les cartes avec Moteur de Rareté & Urgence
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
        // On prend les 3 derniers (les plus récents)
        const featured = allProperties.reverse().slice(0, 3);

        container.innerHTML = ''; 

        featured.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'property-card';
            
            // Animation d'apparition séquentielle (Cascade)
            const delay = index * 150;
            card.style.cssText = `
                background-color: #121212 !important; 
                border: 1px solid #333 !important; 
                border-radius: 8px; 
                overflow: hidden; 
                margin-bottom: 20px; 
                position: relative;
                opacity: 0;
                animation: fadeUp 0.8s ease-out ${delay}ms forwards;
            `;
            
            // 1. BADGE PRESTIGE
            let badgePrestige = '';
            if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
                badgePrestige = `<span style="position:absolute; top:10px; left:10px; background:#D4AF37; color:black; padding:4px 10px; font-weight:800; font-size:0.7rem; z-index:10; text-transform:uppercase; letter-spacing:1px; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">💎 Prestige</span>`;
            }

            // 2. BADGE VENTE / LOCATION
            let typeAction = "VENTE";
            let badgeColor = "#D4AF37"; // Or par défaut
            const categorieBien = (p.categorie || "").toLowerCase();
            
            if (categorieBien.includes('loc')) {
                typeAction = "LOCATION";
                badgeColor = "#ffffff"; // Blanc pour location
            }

            const badgeStatus = `<span class="badge-status" style="position: absolute; top: 15px; right: 15px; background-color: #020610; color: ${badgeColor} !important; border: 1px solid ${badgeColor}; padding: 5px 15px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; border-radius: 2px; z-index: 10; letter-spacing: 1px;">${typeAction}</span>`;

            // 3. MOTEUR DE RARETÉ (SCARCITY ENGINE) - Le code ZORG
            // Génère un chiffre aléatoire entre 2 et 5 spectateurs
            const viewers = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
            const scarcityTag = `
                <div style="position:absolute; bottom:10px; right:10px; background:rgba(255,0,0,0.85); color:white; font-size:0.7rem; padding:4px 10px; border-radius:20px; display:flex; align-items:center; gap:5px; backdrop-filter:blur(4px); z-index:10; font-weight:600;">
                    <span style="width:6px; height:6px; background:white; border-radius:50%; animation: pulse 1.5s infinite;"></span>
                    ${viewers} intéressés
                </div>
            `;

            // CONSTRUCTION DE LA CARTE HTML
            card.innerHTML = `
                <div class="property-image" style="height:250px; position:relative;">
                    ${badgePrestige}
                    ${badgeStatus}
                    ${typeAction === 'VENTE' ? scarcityTag : ''} <a href="detail.html?id=${p.id}">
                        <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='assets/images/default.jpg'">
                    </a>
                </div>
                
                <div class="property-details" style="padding: 25px;">
                    <h3 style="margin-top:0; margin-bottom:5px;">
                        <a href="detail.html?id=${p.id}" style="text-decoration:none; color: #FFFFFF !important; font-family:'Playfair Display', serif; font-size:1.4rem; display:block; letter-spacing:0.5px;">${p.titre}</a>
                    </h3>
                    
                    <p style="color: #888 !important; font-size:0.85rem; margin-bottom:20px; display:flex; align-items:center; text-transform:uppercase; letter-spacing:1px;">
                        <i class="fas fa-map-marker-alt" style="color:#4aa3df !important; margin-right:8px;"></i> 
                        ${p.ville}
                    </p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:end; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
                        <div class="price" style="color: #D4AF37 !important; font-family:'Playfair Display', serif; font-weight:bold; font-size:1.4rem;">${p.prix} <span style="font-size:0.8rem; font-family:'Montserrat', sans-serif; color:#666;">Ar</span></div>
                        
                        <a href="detail.html?id=${p.id}" style="color: #D4AF37 !important; text-decoration:none; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:5px;">
                            Dossier <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:#666; text-align:center; padding:20px;">Chargement du catalogue privé...</p>';
    }
}

// Fonction utilitaire CSV (Inchangée mais nécessaire)
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
