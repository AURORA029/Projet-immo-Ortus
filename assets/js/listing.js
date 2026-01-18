/* * LISTING.JS - VERSION CORRIGÉE ET BLINDÉE 🛡️
 * Gère les espaces, les virgules et les nouvelles lignes correctement.
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

let allProperties = []; 

document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
});

// 1. RÉCUPÉRATION
async function fetchProperties() {
    const container = document.getElementById('listing-container');
    
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Utilisation du NOUVEAU convertisseur intelligent
        allProperties = csvToJSON(data); 
        
        const urlParams = new URLSearchParams(window.location.search);
        const filterFromHome = urlParams.get('filtre');

        if (filterFromHome && filterFromHome !== 'all') {
            const searchInput = document.getElementById('searchInput');
            if(searchInput) searchInput.value = filterFromHome; 
            filterProperties(filterFromHome); 
        } else {
            displayProperties(allProperties);
        }

    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Erreur de lecture des données.</p>';
    }
}

// 2. FILTRE
function filterProperties(query = null) {
    const inputVal = query || document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allProperties.filter(p => {
        return (p.ville && p.ville.toLowerCase().includes(inputVal)) ||
               (p.titre && p.titre.toLowerCase().includes(inputVal)) ||
               (p.type && p.type.toLowerCase().includes(inputVal));
    });
    
    displayProperties(filtered);
}

// 3. AFFICHAGE
function displayProperties(properties) {
    const container = document.getElementById('listing-container');
    container.innerHTML = '';

    if (properties.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:white; width:100%;">Aucun bien trouvé.</p>';
        return;
    }

    properties.forEach(p => {
        const card = createPropertyCard(p);
        container.appendChild(card);
    });

    attachFormHandlers();
}

// 4. DESIGN CARTE
function createPropertyCard(p) {
    const div = document.createElement('div');
    div.className = 'property-card';
    
    let badgesHtml = '';
    if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
        badgesHtml += `<span class="badge" style="background:#D4AF37; color:#000;">💎 PRESTIGE</span>`;
    }
    if (p.categorie) {
        let top = p.gamme && p.gamme.toLowerCase().includes('prestige') ? '40px' : '10px';
        badgesHtml += `<span class="badge status" style="top:${top};">${p.categorie}</span>`;
    }

    let garageHtml = '';
    if (p.stationnement && p.stationnement.length > 0) {
        garageHtml = `<span><i class="fas fa-car" style="color:#D4AF37;"></i> ${p.stationnement}</span>`;
    }

    let videoBtn = '';
    // On nettoie le lien vidéo au cas où il y ait des espaces
    let videoLink = p.video ? p.video.trim() : '';
    if (videoLink && videoLink.startsWith('http')) {
        videoBtn = `<a href="${videoLink}" target="_blank" class="btn-video" style="display:flex; align-items:center; justify-content:center; gap:10px; margin-top:10px; color:#D4AF37; border:1px solid #D4AF37; padding:8px; border-radius:4px; text-decoration:none;"><i class="fas fa-play-circle"></i> VISITE VIDÉO</a>`;
    }

    let featuresList = '';
    if (p.caracteristiques) {
        // On remplace les retours à la ligne par des virgules pour nettoyer
        let cleanFeat = p.caracteristiques.replace(/\n/g, ',');
        const feats = cleanFeat.split(',').slice(0, 3); 
        featuresList = feats.map(f => `<li><i class="fas fa-check" style="color:#D4AF37;"></i> ${f.trim()}</li>`).join('');
    }

    div.innerHTML = `
        <div class="property-image">
            ${badgesHtml}
            <img src="${p.image}" alt="${p.titre}" onerror="this.src='assets/images/default.jpg'">
        </div>
        <div class="property-details">
            <h3>${p.titre}</h3>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${p.ville}</p>
            <div class="features">
                <span><i class="fas fa-bed"></i> ${p.pieces} p.</span>
                <span><i class="fas fa-ruler-combined"></i> ${p.surface} m²</span>
                ${garageHtml}
            </div>
            <div class="price">${p.prix}</div>
            <ul class="amenities-list" style="list-style:none; padding:0; font-size:0.9rem; color:#aaa; margin:10px 0;">
                ${featuresList}
            </ul>
            ${videoBtn}
            <button class="btn-contact-card" onclick="toggleForm('form-${p.id}')" style="width:100%; padding:10px; margin-top:10px; cursor:pointer;">Ce bien m'intéresse</button>
            
            <div id="form-${p.id}" class="card-form" style="display:none; margin-top:15px; background:#111; padding:15px;">
                <form class="ajax-form" action="${FORMSPREE_ENDPOINT}" method="POST">
                    <input type="hidden" name="bien_ref" value="${p.id} - ${p.titre}">
                    <input type="text" name="nom" placeholder="Votre Nom" required style="width:100%; margin-bottom:10px;">
                    <input type="tel" name="tel" placeholder="Téléphone" required style="width:100%; margin-bottom:10px;">
                    <input type="email" name="email" placeholder="Email" required style="width:100%; margin-bottom:10px;">
                    <button type="submit" style="width:100%; background:#D4AF37; border:none; padding:10px;">ENVOYER</button>
                    <p class="form-status" style="display:none; color:#D4AF37; margin-top:5px;"></p>
                </form>
            </div>
        </div>
    `;
    return div;
}

// 5. NOUVEAU PARSEUR CSV (INTELLIGENT) 🧠
// C'est lui qui répare tout !
function csvToJSON(csvText) {
    const lines = [];
    let newLine = '';
    let inQuote = false;

    // Étape A : On reconstitue les lignes en ignorant les retours à la ligne DANS les guillemets
    for (let i = 0; i < csvText.length; i++) {
        let char = csvText[i];
        if (char === '"') inQuote = !inQuote;
        if (char === '\n' && !inQuote) {
            lines.push(newLine);
            newLine = '';
        } else {
            newLine += char;
        }
    }
    if (newLine) lines.push(newLine);

    if (lines.length < 2) return []; 

    // Étape B : On lit les titres (Ligne 1)
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    // Étape C : On lit chaque ligne case par case
    return lines.slice(1).map(line => {
        const values = [];
        let currentVal = '';
        let inQuoteVal = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            // Si c'est un guillemet, on bascule le mode "citation"
            if (char === '"') {
                inQuoteVal = !inQuoteVal;
                continue; 
            }
            
            // Si c'est une virgule ET qu'on n'est pas dans des guillemets -> C'est une séparation
            if (char === ',' && !inQuoteVal) {
                values.push(currentVal.trim());
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal.trim()); // La dernière valeur

        let obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || ''; 
        });
        return obj;
    });
}

// 6. UTILITAIRES
function toggleForm(id) {
    const form = document.getElementById(id);
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
}

function attachFormHandlers() {
    const forms = document.querySelectorAll('.ajax-form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = form.querySelector('button');
            const status = form.querySelector('.form-status');
            btn.innerText = '...';
            
            const data = new FormData(form);
            fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            }).then(r => {
                if (r.ok) window.location.href = 'merci.html';
                else { status.innerText = "Erreur."; status.style.display = 'block'; btn.innerText = "ENVOYER"; }
            }).catch(e => {
                status.innerText = "Erreur réseau."; status.style.display = 'block'; btn.innerText = "ENVOYER";
            });
        });
    });
}
