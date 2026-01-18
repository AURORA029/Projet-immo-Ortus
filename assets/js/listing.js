/* LISTING.JS - VERSION FINALE (PAGINATION + CONTRASTE GARANTI 👁️)
 * - Gère la pagination (Page 1, 2, 3...)
 * - Force le design "Dark Luxe" pour éviter les textes invisibles
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

// --- RÉGLAGES ---
const ITEMS_PER_PAGE = 9; // 9 Maisons par page
let currentPage = 1;
let currentProperties = []; 
let allProperties = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
});

// 1. CHARGEMENT DES DONNÉES
async function fetchProperties() {
    const container = document.getElementById('listing-container');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        allProperties = csvToJSON(data); 
        
        // Gestion du filtre venant de l'accueil
        const urlParams = new URLSearchParams(window.location.search);
        let filterFromHome = urlParams.get('filtre');

        if (filterFromHome && filterFromHome !== 'all') {
            filterFromHome = decodeURIComponent(filterFromHome).trim();
            const searchInput = document.getElementById('searchInput');
            if(searchInput) searchInput.value = filterFromHome; 
            filterProperties(filterFromHome); 
        } else {
            // Affichage par défaut (Page 1)
            currentProperties = allProperties;
            renderPage(1);
        }

    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = '<p style="text-align:center; color:white;">Erreur de lecture des données.</p>';
    }
}

// 2. MOTEUR DE RECHERCHE
function filterProperties(query = null) {
    let inputVal = query;
    if (inputVal === null) {
        const inputEl = document.getElementById('searchInput');
        inputVal = inputEl ? inputEl.value : '';
    }
    inputVal = inputVal.toLowerCase().trim();
    
    if (!inputVal) {
        currentProperties = allProperties;
    } else {
        currentProperties = allProperties.filter(p => {
            const ville = p.ville ? p.ville.toLowerCase() : '';
            const titre = p.titre ? p.titre.toLowerCase() : '';
            const type = p.type ? p.type.toLowerCase() : '';
            const desc = p.description ? p.description.toLowerCase() : '';
            const carac = p.caracteristiques ? p.caracteristiques.toLowerCase() : '';
            const prix = p.prix ? p.prix.toLowerCase() : '';

            return ville.includes(inputVal) || titre.includes(inputVal) || type.includes(inputVal) || 
                   desc.includes(inputVal) || carac.includes(inputVal) || prix.includes(inputVal);
        });
    }
    // Retour page 1 après recherche
    renderPage(1);
}

// 3. AFFICHAGE DES PAGES (PAGINATION)
function renderPage(page) {
    currentPage = page;
    const container = document.getElementById('listing-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    if (currentProperties.length === 0) {
        container.innerHTML = '<div style="text-align:center; width:100%; padding:50px;"><h3 style="color:white;">Aucun résultat</h3><button onclick="document.getElementById(\'searchInput\').value=\'\'; filterProperties();" style="margin-top:20px; padding:10px 20px; background:#D4AF37; border:none; cursor:pointer;">Voir tout</button></div>';
        return;
    }

    // Calcul des éléments à afficher
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = currentProperties.slice(start, end);

    paginatedItems.forEach(p => {
        container.appendChild(createPropertyCard(p));
    });

    attachFormHandlers();
    renderPaginationButtons();
    
    // Scroll doux vers le haut
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function renderPaginationButtons() {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(currentProperties.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) return;

    // Bouton Précédent
    if (currentPage > 1) {
        const btnPrev = document.createElement('button');
        btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
        btnPrev.style.cssText = "padding:10px 15px; background:#222; color:white; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
        btnPrev.onclick = () => renderPage(currentPage - 1);
        paginationContainer.appendChild(btnPrev);
    }

    // Boutons Numéros
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) {
            btn.style.cssText = "padding:10px 15px; background:#D4AF37; color:black; border:none; font-weight:bold; margin:0 5px; border-radius:4px;";
        } else {
            btn.style.cssText = "padding:10px 15px; background:#222; color:white; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
            btn.onclick = () => renderPage(i);
        }
        paginationContainer.appendChild(btn);
    }

    // Bouton Suivant
    if (currentPage < totalPages) {
        const btnNext = document.createElement('button');
        btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnNext.style.cssText = "padding:10px 15px; background:#222; color:white; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
        btnNext.onclick = () => renderPage(currentPage + 1);
        paginationContainer.appendChild(btnNext);
    }
}

// 4. DESIGN CARTE (CORRIGÉ : TEXTE NOIR SUR FOND BLANC)
function createPropertyCard(p) {
    const div = document.createElement('div');
    div.className = 'property-card';
    
    // FOND BLANC
    div.style.cssText = "background-color: #FFFFFF; border: 1px solid #eee; overflow: hidden; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);";
    
        // --- GESTION DES BADGES (CORRIGÉE : GAUCHE & DROITE) ---
    let badgesHtml = '';

    // 1. Badge PRESTIGE -> En haut à GAUCHE (Left)
    if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
        badgesHtml += `<span class="badge" style="background:#D4AF37; color:#000; position:absolute; top:10px; left:10px; padding:5px 10px; font-weight:bold; z-index:2; border-radius:4px; font-size:0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">💎 PRESTIGE</span>`;
    }

    // 2. Badge VENTE/LOCATION -> En haut à DROITE (Right)
    if (p.categorie) {
        // J'ai mis right:10px au lieu de calculer une position à gauche
        // Et j'ai ajouté un petit style noir et or pour faire classe
        badgesHtml += `<span class="badge status" style="background:#000; color:white; border:1px solid #D4AF37; position:absolute; top:10px; right:10px; padding:5px 10px; z-index:2; font-weight:bold; text-transform:uppercase; font-size:0.8rem; border-radius:4px;">${p.categorie}</span>`;
    }


    // --- C'EST ICI QUE JE FORCE LE NOIR POUR LES ATOUTS ---
    let featuresList = '';
    if (p.caracteristiques) {
        let cleanFeat = p.caracteristiques.replace(/\n/g, ',');
        const feats = cleanFeat.split(',').slice(0, 3); 
        featuresList = feats.map(f => 
            // 👉 COLOR: #000000 (NOIR)
            `<li style="color: #000000; margin-bottom: 5px; display:flex; align-items:center; font-size:0.9rem; font-weight:500;">
                <i class="fas fa-check" style="color:#D4AF37; margin-right:8px;"></i> ${f.trim()}
            </li>`
        ).join('');
    }

    div.innerHTML = `
        <div class="property-image" style="height:250px; position:relative; overflow:hidden;">
            ${badgesHtml}
            <a href="detail.html?id=${p.id}">
                <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition:0.3s;" onerror="this.src='assets/images/default.jpg'">
            </a>
        </div>
        
        <div class="property-details" style="padding: 20px;">
            <h3 style="margin-bottom:10px; margin-top:0;">
                <a href="detail.html?id=${p.id}" style="text-decoration:none; color: #000000; font-size:1.3rem;">${p.titre}</a>
            </h3>
            
            <p class="location" style="color:#444444; font-size:0.9rem; margin-bottom:15px;">
                <i class="fas fa-map-marker-alt" style="color:#D4AF37;"></i> ${p.ville}
            </p>
            
            <div class="features" style="display:flex; gap:15px; margin-bottom:15px; color:#333;">
                <span><i class="fas fa-door-open" style="color:#D4AF37;"></i> ${p.pieces} p.</span>
                <span><i class="fas fa-ruler-combined" style="color:#D4AF37;"></i> ${p.surface} m²</span>
            </div>
            
            <div class="price" style="color: #D4AF37; font-weight:bold; font-size:1.4rem; margin-bottom:15px;">${p.prix}</div>
            
            <ul class="amenities-list" style="list-style:none; padding:0; margin-bottom:20px; color: #000000;">
                ${featuresList}
            </ul>
            
            <div style="display:flex; gap:10px;">
                 <a href="detail.html?id=${p.id}" style="flex:1; text-align:center; padding:10px; background:transparent; border:1px solid #D4AF37; color:#000; text-decoration:none; border-radius:4px; font-weight:bold; transition:0.3s;" onmouseover="this.style.background='#D4AF37'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#000'">
                   Voir détails
                </a>
                <button class="btn-contact-card" onclick="toggleForm('form-${p.id}')" style="flex:1; padding:10px; background:#D4AF37; color:black; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
                    Contact
                </button>
            </div>
            
            <div id="form-${p.id}" class="card-form" style="display:none; margin-top:15px; background:#f9f9f9; padding:15px; border-radius:5px;">
                <form class="ajax-form" action="${FORMSPREE_ENDPOINT}" method="POST">
                    <input type="hidden" name="bien_ref" value="${p.id} - ${p.titre}">
                    <input type="text" name="nom" placeholder="Votre Nom" required style="width:100%; margin-bottom:10px; padding:10px; border:1px solid #ccc; border-radius:3px;">
                    <input type="tel" name="tel" placeholder="Téléphone" required style="width:100%; margin-bottom:10px; padding:10px; border:1px solid #ccc; border-radius:3px;">
                    <button type="submit" style="width:100%; background:#D4AF37; border:none; padding:10px; font-weight:bold; cursor:pointer;">ENVOYER</button>
                    <p class="form-status" style="display:none; color:green; margin-top:5px; text-align:center;"></p>
                </form>
            </div>
        </div>
    `;
    return div;
}


// 5. PARSEUR CSV
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
function toggleForm(id) { const form = document.getElementById(id); form.style.display = (form.style.display === 'none') ? 'block' : 'none'; }
function attachFormHandlers() {
    const forms = document.querySelectorAll('.ajax-form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = form.querySelector('button');
            const status = form.querySelector('.form-status');
            btn.innerText = 'Envoi...';
            const data = new FormData(form);
            fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } })
            .then(r => { if (r.ok) { btn.innerText = "ENVOYÉ !"; btn.style.background = "green"; } else { status.innerText = "Erreur."; status.style.display='block'; btn.innerText="ENVOYER"; }})
            .catch(e => { status.innerText = "Erreur réseau."; status.style.display='block'; btn.innerText="ENVOYER"; });
        });
    });
}
