/* HOME.JS - VERSION LUXE DARK FINAL (Texte Clair & Lisible 👁️)
 * Fond Noir, Titre Blanc, Ville Gris Clair, Prix Or
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

        featured.forEach(p => {
            const card = document.createElement('div');
            card.className = 'property-card';
            
            // 🎨 STYLE DE LA CARTE : Fond Noir Profond + Bordure fine
            card.style.cssText = "background: #121212; border: 1px solid #333; border-radius: 8px; overflow: hidden; margin-bottom: 20px;";
            
            // Badge Prestige
            let badge = '';
            if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
                badge = `<span style="position:absolute; top:10px; left:10px; background:#D4AF37; color:black; padding:5px 10px; font-weight:bold; font-size:0.8rem; z-index:10; border-radius:2px;">💎 PRESTIGE</span>`;
            }

            // Génération HTML avec COULEURS FORCÉES
            card.innerHTML = `
                <div class="property-image" style="height:250px; position:relative;">
                    ${badge}
                    <a href="detail.html?id=${p.id}">
                        <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition:0.5s;" onerror="this.src='assets/images/default.jpg'">
                    </a>
                </div>
                
                <div class="property-details" style="padding: 20px;">
                    <h3 style="margin-top:0; margin-bottom:10px;">
                        <a href="detail.html?id=${p.id}" style="text-decoration:none; color: #FFFFFF; font-family:'Playfair Display', serif; font-size:1.3rem;">${p.titre}</a>
                    </h3>
                    
                    <p style="color: #E0E0E0; font-size:0.95rem; margin-bottom:15px; display:flex; align-items:center;">
                        <i class="fas fa-map-marker-alt" style="color:#D4AF37; margin-right:8px;"></i> ${p.ville}
                    </p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #333; padding-top:15px;">
                        <div class="price" style="color: #D4AF37; font-weight:bold; font-size:1.2rem;">${p.prix}</div>
                        
                        <a href="detail.html?id=${p.id}" style="color: white; text-decoration:none; font-size:0.9rem; border:1px solid #555; padding:8px 15px; border-radius:50px; transition:0.3s;" onmouseover="this.style.background='white'; this.style.color='black'" onmouseout="this.style.background='transparent'; this.style.color='white'">
                            Voir <i class="fas fa-arrow-right" style="font-size:0.8rem; margin-left:5px;"></i>
                        </a>
                    </div>
                </div>
            `;
            
            // Petit effet de survol
            card.onmouseenter = function() { this.style.transform = "translateY(-5px)"; this.style.borderColor = "#D4AF37"; };
            card.onmouseleave = function() { this.style.transform = "translateY(0)"; this.style.borderColor = "#333"; };

            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; text-align:center;">Impossible de charger les biens.</p>';
    }
}

// Convertisseur CSV (Ne change pas)
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
