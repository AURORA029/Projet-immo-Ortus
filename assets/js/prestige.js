/* PRESTIGE.JS - VERSION PAGINÉE & LUXE 💎
 * Affiche uniquement les biens 'Prestige' avec pagination
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";

// --- RÉGLAGES ---
const ITEMS_PER_PAGE = 9; // Nombre de villas par page
let currentPage = 1;
let prestigeProperties = []; 

document.addEventListener('DOMContentLoaded', () => {
    fetchPrestigeProperties();
});

async function fetchPrestigeProperties() {
    const container = document.getElementById('prestige-container');
    
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const allProperties = csvToJSON(data); 

        // FILTRE : On ne garde que PRESTIGE
        prestigeProperties = allProperties.filter(p => 
            p.gamme && p.gamme.toLowerCase().includes('prestige')
        );

        if (prestigeProperties.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">Aucun bien de prestige disponible pour le moment.</p>';
            return;
        }

        // On lance l'affichage de la page 1
        renderPage(1);

    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Erreur de chargement.</p>';
    }
}

// SYSTÈME DE PAGINATION
function renderPage(page) {
    currentPage = page;
    const container = document.getElementById('prestige-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = prestigeProperties.slice(start, end);

    paginatedItems.forEach(p => {
        container.appendChild(createPrestigeCard(p));
    });

    renderPaginationButtons();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function renderPaginationButtons() {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(prestigeProperties.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) return;

    // Bouton Précédent
    if (currentPage > 1) {
        const btnPrev = document.createElement('button');
        btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
        btnPrev.style.cssText = "padding:10px 15px; background:#222; color:white; border:1px solid #333; cursor:pointer; margin:0 5px;";
        btnPrev.onclick = () => renderPage(currentPage - 1);
        paginationContainer.appendChild(btnPrev);
    }

    // Boutons Numéros
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) {
            btn.style.cssText = "padding:10px 15px; background:#D4AF37; color:black; border:none; font-weight:bold; margin:0 5px;";
        } else {
            btn.style.cssText = "padding:10px 15px; background:#222; color:white; border:1px solid #333; cursor:pointer; margin:0 5px;";
            btn.onclick = () => renderPage(i);
        }
        paginationContainer.appendChild(btn);
    }

    // Bouton Suivant
    if (currentPage < totalPages) {
        const btnNext = document.createElement('button');
        btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnNext.style.cssText = "padding:10px 15px; background:#222; color:white; border:1px solid #333; cursor:pointer; margin:0 5px;";
        btnNext.onclick = () => renderPage(currentPage + 1);
        paginationContainer.appendChild(btnNext);
    }
}

// DESIGN CARTE SPÉCIAL PRESTIGE (FOND NOIR / TEXTE OR & BLANC) - VERSION BRUTE 🛡️
function createPrestigeCard(p) {
    const div = document.createElement('div');
    div.className = 'property-card';
    
    // FOND NOIR LUXE IMPOSÉ
    // J'ajoute !important sur le fond aussi, au cas où.
    div.style.cssText = "background-color: #121212 !important; border: 1px solid #333; border-radius: 8px; overflow: hidden; position: relative; margin-bottom: 20px;";

    // Badge Exclusivité ( inchangé )
    const badgeHtml = `<span style="position:absolute; top:15px; left:15px; background:#D4AF37; color:black; padding:5px 15px; font-weight:bold; letter-spacing:1px; font-size:0.8rem; z-index:10; border-radius:2px;">💎 EXCLUSIVITÉ</span>`;

    div.innerHTML = `
        <div class="property-image" style="height:300px; position:relative;">
            ${badgeHtml}
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
                
                <a href="detail.html?id=${p.id}" style="color: white; text-decoration:none; border:1px solid #D4AF37; padding:10px 20px; border-radius:0; transition:0.3s;" onmouseover="this.style.background='#D4AF37'; this.style.color='black'" onmouseout="this.style.background='transparent'; this.style.color='white'">
                    DÉCOUVRIR
                </a>
            </div>
        </div>
    `;
    return div;
}


// Convertisseur CSV standard
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
