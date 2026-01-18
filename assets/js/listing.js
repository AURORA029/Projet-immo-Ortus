/* * LISTING.JS - VERSION FINALE (CORRECTIF ACCUEIL + IMAGES)
 * Ce script gère tout : l'accueil, la recherche, l'affichage et les formulaires.
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

let allProperties = []; 

document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
});

// 1. CHARGEMENT ET RÉCEPTION DE LA RECHERCHE ACCUEIL
async function fetchProperties() {
    const container = document.getElementById('listing-container');
    
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // On transforme le CSV en données utilisables
        allProperties = csvToJSON(data); 
        
        // --- C'EST ICI QUE SE JOUE LA CONNEXION AVEC L'ACCUEIL ---
        const urlParams = new URLSearchParams(window.location.search);
        let filterFromHome = urlParams.get('filtre');

        if (filterFromHome && filterFromHome !== 'all') {
            // On décode les caractères spéciaux (ex: "Mahajanga%20" devient "Mahajanga")
            filterFromHome = decodeURIComponent(filterFromHome).trim();
            
            // On remplit la barre de recherche visuellement pour que l'utilisateur comprenne
            const searchInput = document.getElementById('searchInput');
            if(searchInput) searchInput.value = filterFromHome; 
            
            // On lance le filtre immédiatement avec le mot venant de l'accueil
            filterProperties(filterFromHome); 
        } else {
            // Sinon, on affiche tout normalement
            displayProperties(allProperties);
        }

    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Erreur de lecture des données.</p>';
    }
}

// 2. MOTEUR DE RECHERCHE (Cherche PARTOUT : Titre, Ville, Desc...)
function filterProperties(query = null) {
    // Si 'query' est fourni (venant de l'accueil), on l'utilise. 
    // Sinon, on regarde ce qu'il y a dans la barre de recherche de la page.
    let inputVal = query;
    if (inputVal === null) {
        const inputEl = document.getElementById('searchInput');
        inputVal = inputEl ? inputEl.value : '';
    }
    
    // On met tout en minuscule et on nettoie
    inputVal = inputVal.toLowerCase().trim();
    
    // Si vide, on montre tout
    if (!inputVal) {
        displayProperties(allProperties);
        return;
    }

    const filtered = allProperties.filter(p => {
        // On sécurise les variables (au cas où une case est vide dans Excel)
        const ville = p.ville ? p.ville.toLowerCase() : '';
        const titre = p.titre ? p.titre.toLowerCase() : '';
        const type = p.type ? p.type.toLowerCase() : '';
        const desc = p.description ? p.description.toLowerCase() : '';
        const carac = p.caracteristiques ? p.caracteristiques.toLowerCase() : '';
        const prix = p.prix ? p.prix.toLowerCase() : '';

        // La recherche magique : est-ce que le mot est caché ici ?
        return ville.includes(inputVal) ||
               titre.includes(inputVal) ||
               type.includes(inputVal) ||
               desc.includes(inputVal) ||
               carac.includes(inputVal) ||
               prix.includes(inputVal);
    });
    
    displayProperties(filtered);
}

// 3. AFFICHAGE DES CARTES
function displayProperties(properties) {
    const container = document.getElementById('listing-container');
    container.innerHTML = '';

    if (properties.length === 0) {
        container.innerHTML = '<div style="text-align:center; width:100%; padding:50px;"><h3 style="color:white;">Aucun résultat</h3><p style="color:#aaa;">Essayez un autre mot clé (ex: Villa, Piscine, Ivandry...)</p><button onclick="displayProperties(allProperties); document.getElementById(\'searchInput\').value=\'\';" style="margin-top:20px; padding:10px 20px; background:#D4AF37; border:none; cursor:pointer;">Voir tout les biens</button></div>';
        return;
    }

    properties.forEach(p => {
        container.appendChild(createPropertyCard(p));
    });

    attachFormHandlers();
}

// 4. CRÉATION DU DESIGN DE LA CARTE
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
    let videoLink = p.video ? p.video.trim() : '';
    if (videoLink && videoLink.startsWith('http')) {
        videoBtn = `<a href="${videoLink}" target="_blank" class="btn-video" style="display:flex; align-items:center; justify-content:center; gap:10px; margin-top:10px; color:#D4AF37; border:1px solid #D4AF37; padding:8px; border-radius:4px; text-decoration:none;"><i class="fas fa-play-circle"></i> VISITE VIDÉO</a>`;
    }

    let featuresList = '';
    if (p.caracteristiques) {
        let cleanFeat = p.caracteristiques.replace(/\n/g, ',');
        const feats = cleanFeat.split(',').slice(0, 3); 
        featuresList = feats.map(f => `<li><i class="fas fa-check" style="color:#D4AF37;"></i> ${f.trim()}</li>`).join('');
    }

       // --- Construction du HTML de la carte ---
    div.innerHTML = `
        <div class="property-image" style="height:250px; overflow:hidden;">
            ${badgesHtml}
            <a href="detail.html?id=${p.id}">
                <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition:0.3s;" onerror="this.src='assets/images/default.jpg'">
            </a>
        </div>
        <div class="property-details">
            <h3 style="margin-bottom:5px;">
                <a href="detail.html?id=${p.id}" style="text-decoration:none; color:white;">${p.titre}</a>
            </h3>
            <p class="location" style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt"></i> ${p.ville}</p>
            
            <div class="features" style="display:flex; gap:15px; margin:10px 0; color:#ddd;">
                <span><i class="fas fa-bed"></i> ${p.pieces} p.</span>
                <span><i class="fas fa-ruler-combined"></i> ${p.surface} m²</span>
                ${garageHtml}
            </div>
            
            <div class="price" style="font-size:1.2rem; font-weight:bold; color:#D4AF37; margin:10px 0;">
                ${p.prix}
            </div>
            
            <ul class="amenities-list" style="list-style:none; padding:0; font-size:0.85rem; color:#aaa; margin-bottom:15px;">
                ${featuresList}
            </ul>
            
            <div style="display:flex; gap:10px; margin-top:10px;">
                <a href="detail.html?id=${p.id}" class="btn-detail" 
                   style="flex:1; text-align:center; padding:10px; background:transparent; border:1px solid #fff; color:white; text-decoration:none; border-radius:4px;">
                   Voir détails
                </a>
                
                <button class="btn-contact-card" onclick="toggleForm('form-${p.id}')" 
                        style="flex:1; padding:10px; background:#D4AF37; color:black; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
                    Contact
                </button>
            </div>

            <div id="form-${p.id}" class="card-form" style="display:none; margin-top:15px; background:#111; padding:15px;">
                <form class="ajax-form" action="${FORMSPREE_ENDPOINT}" method="POST">
                    <input type="hidden" name="bien_ref" value="${p.id} - ${p.titre}">
                    <input type="text" name="nom" placeholder="Votre Nom" required style="width:100%; margin-bottom:10px; padding:8px;">
                    <input type="tel" name="tel" placeholder="Téléphone" required style="width:100%; margin-bottom:10px; padding:8px;">
                    <input type="email" name="email" placeholder="Email" required style="width:100%; margin-bottom:10px; padding:8px;">
                    <button type="submit" style="width:100%; background:#D4AF37; border:none; padding:10px; cursor:pointer;">ENVOYER</button>
                    <p class="form-status" style="display:none; color:#D4AF37; margin-top:5px;"></p>
                </form>
            </div>
        </div>
    `;

    return div;
}

// 5. PARSEUR CSV INTELLIGENT (Gère virgules et guillemets)
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
            fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } })
            .then(r => { if (r.ok) window.location.href = 'merci.html'; else { status.innerText = "Erreur."; status.style.display='block'; btn.innerText="ENVOYER"; }})
            .catch(e => { status.innerText = "Erreur réseau."; status.style.display='block'; btn.innerText="ENVOYER"; });
        });
    });
}
