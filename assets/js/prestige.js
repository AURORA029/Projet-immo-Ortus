/* PRESTIGE.JS - VERSION LUXE DARK VISIBLE 💎 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";

document.addEventListener('DOMContentLoaded', () => {
    fetchPrestigeProperties();
});

async function fetchPrestigeProperties() {
    const container = document.getElementById('prestige-container');
    
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const allProperties = csvToJSON(data); 

        // FILTRE : Uniquement si 'gamme' contient 'prestige'
        const prestigeProperties = allProperties.filter(p => 
            p.gamme && p.gamme.toLowerCase().includes('prestige')
        );

        container.innerHTML = ''; 

        if (prestigeProperties.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">Aucun bien de prestige disponible.</p>';
            return;
        }

        prestigeProperties.forEach(p => {
            const card = document.createElement('div');
            card.className = 'property-card';
            
            // STYLE FORCÉ : FOND NOIR
            card.style.cssText = "background-color: #121212 !important; border: 1px solid #333 !important; border-radius: 8px; overflow: hidden; position: relative; margin-bottom: 20px;";

            card.innerHTML = `
                <div class="property-image" style="height:300px; position:relative;">
                    <span style="position:absolute; top:15px; left:15px; background:#D4AF37; color:black; padding:5px 15px; font-weight:bold; letter-spacing:1px; font-size:0.8rem; z-index:10;">💎 EXCLUSIVITÉ</span>
                    <a href="detail.html?id=${p.id}">
                        <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition:0.5s;" onerror="this.src='assets/images/default.jpg'">
                    </a>
                </div>
                
                <div class="property-details" style="padding: 25px;">
                    <h3 style="margin-top:0; margin-bottom:10px;">
                        <a href="detail.html?id=${p.id}" style="text-decoration:none; color: #FFFFFF !important; font-family:'Playfair Display', serif; font-size:1.4rem;">${p.titre}</a>
                    </h3>
                    
                    <p style="color: #E0E0E0 !important; font-size:0.9rem; margin-bottom:20px;">
                        <i class="fas fa-map-marker-alt" style="color:#D4AF37 !important;"></i> ${p.ville}
                    </p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #333; padding-top:20px;">
                        <div class="price" style="color: #D4AF37 !important; font-weight:bold; font-size:1.3rem;">${p.prix}</div>
                        
                        <a href="detail.html?id=${p.id}" style="color: white !important; text-decoration:none; border:1px solid #D4AF37; padding:10px 20px; border-radius:0; transition:0.3s; display:inline-block;" onmouseover="this.style.background='#D4AF37'; this.style.color='black'" onmouseout="this.style.background='transparent'; this.style.color='white'">
                            DÉCOUVRIR
                        </a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Erreur de chargement.</p>';
    }
}

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
