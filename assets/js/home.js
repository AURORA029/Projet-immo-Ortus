/* HOME.JS - Affiche les 3 derniers biens sur l'accueil */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";

document.addEventListener('DOMContentLoaded', () => {
    fetchFeatured();
});

async function fetchFeatured() {
    const container = document.getElementById('featured-container');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const allProperties = csvToJSON(data); // Utilise le convertisseur (voir plus bas)

        // ON PREND LES 3 DERNIERS BIENS (Les plus récents)
        // .reverse() inverse la liste, .slice(0, 3) prend les 3 premiers
        const featured = allProperties.reverse().slice(0, 3);

        container.innerHTML = ''; // On vide le "chargement..."

        featured.forEach(p => {
            // On créé une carte simplifiée pour l'accueil
            const card = document.createElement('div');
            card.className = 'property-card';
            
            // Logique Prestige
            let badge = '';
            if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
                badge = `<span class="badge" style="background:#D4AF37; color:#000;">💎 PRESTIGE</span>`;
            }

            card.innerHTML = `
                <div class="property-image" style="height:250px; overflow:hidden; position:relative;">
                    ${badge}
                    <a href="detail.html?id=${p.id}">
                        <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover;">
                    </a>
                </div>
                <div class="property-details">
                    <h3><a href="detail.html?id=${p.id}" style="text-decoration:none; color:inherit;">${p.titre}</a></h3>
                    <p style="color:#888;"><i class="fas fa-map-marker-alt"></i> ${p.ville}</p>
                    <div class="price" style="color:#D4AF37; font-weight:bold; font-size:1.2rem; margin:10px 0;">${p.prix}</div>
                    <a href="detail.html?id=${p.id}" style="display:block; text-align:center; background:#020610; color:white; padding:10px; text-decoration:none; border-radius:5px;">Voir le bien</a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Impossible de charger les biens.</p>';
    }
}

// Toujours la même fonction magique pour lire le CSV (Copie-colle là aussi)
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
