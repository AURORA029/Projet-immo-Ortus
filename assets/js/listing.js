/* LISTING.JS - VERSION FUSION (Design Actuel + Slider Budget) */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

// --- RÉGLAGES ---
const ITEMS_PER_PAGE = 9; 
let currentPage = 1;
let currentProperties = []; 
let allProperties = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
    
    // Écouteur pour le slider de budget (Mise à jour en temps réel)
    const budgetRange = document.getElementById('budgetRange');
    if(budgetRange) {
        budgetRange.addEventListener('input', () => filterProperties());
    }
    
    // Écouteur pour le bouton de recherche texte
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.addEventListener('click', () => filterProperties());
    }
    
    // Écouteur pour la touche "Entrée" dans la barre de texte
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filterProperties();
        });
    }
});

// 1. CHARGEMENT & GESTION URL
async function fetchProperties() {
    const container = document.getElementById('listing-container');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        allProperties = csvToJSON(data); 
        
        // --- GESTION DES PARAMÈTRES VENANT DE L'ACCUEIL ---
        const urlParams = new URLSearchParams(window.location.search);
        const filterTexte = urlParams.get('filtre');
        const filterBudget = urlParams.get('budget');

        // Si texte dans l'URL, on le met dans la barre
        if (filterTexte && filterTexte !== 'all') {
            const decodedTexte = decodeURIComponent(filterTexte).trim();
            const searchInput = document.getElementById('searchInput');
            if(searchInput) searchInput.value = decodedTexte;
        }

        // Si budget dans l'URL, on règle le slider
        if (filterBudget) {
            const budgetRange = document.getElementById('budgetRange');
            if(budgetRange) budgetRange.value = filterBudget;
        }

        // On lance le filtre immédiatement avec les valeurs récupérées
        filterProperties();

    } catch (error) {
        console.error('Erreur:', error);
        if(container) container.innerHTML = '<p style="text-align:center; color:white;">Erreur de lecture des données.</p>';
    }
}

// 2. MOTEUR DE RECHERCHE ULTIME (Smart Search + Budget + Type + Tri) 💎
function filterProperties() {
    // A. Récupération des Inputs
    const inputEl = document.getElementById('searchInput');
    const textVal = inputEl ? inputEl.value.toLowerCase().trim() : '';

    const rangeEl = document.getElementById('budgetRange');
    const maxBudget = rangeEl ? parseInt(rangeEl.value) : 5000000000;

    const categoryEl = document.getElementById('categorySelect');
    const categoryVal = categoryEl ? categoryEl.value : 'all'; 
    
    // Mise à jour visuelle budget
    const displayEl = document.getElementById('budgetDisplay');
    if(displayEl) {
        if(maxBudget >= 5000000000) displayEl.innerText = "Tout afficher";
        else displayEl.innerText = new Intl.NumberFormat('fr-FR').format(maxBudget) + " Ar";
    }

    // B. Le Filtrage
    currentProperties = allProperties.filter(p => {
        // --- MODIFICATION ICI (Smart Search) 👇 ---
        
        // 1. Filtre TEXTE (Multi-mots : "Bungalow Mahajanga")
        // On découpe ce que le client a tapé en mots séparés
        const searchTerms = textVal.split(' ');

        // On rassemble toutes les infos de la maison en une seule phrase pour chercher dedans
        // (J'ajoute p.description et p.caracteristiques pour être sûr de tout trouver)
        const content = (p.ville + " " + p.titre + " " + p.type + " " + (p.description || "") + " " + (p.caracteristiques || "")).toLowerCase();

        // On vérifie que CHAQUE mot tapé par le client existe quelque part dans la fiche maison
        const matchText = searchTerms.every(term => content.includes(term));

        // --- FIN MODIFICATION 👆 ---


        // 2. Filtre PRIX
        const rawPrice = p.prix_calcul ? parseInt(p.prix_calcul.replace(/\s/g, '')) : 0;
        const matchPrice = (maxBudget >= 5000000000) || (rawPrice <= maxBudget);

        // 3. Filtre CATEGORIE (Vente/Location)
        const cat = p.categorie ? p.categorie.toLowerCase() : '';
        const matchCategory = (categoryVal === 'all') || cat.includes(categoryVal);

        // Il faut que les 3 conditions soient OK
        return matchText && matchPrice && matchCategory;
    });

    // C. Le TRI
    const sortSelect = document.getElementById('sortSelect');
    const sortValue = sortSelect ? sortSelect.value : 'default';

    if (sortValue === 'asc') {
        currentProperties.sort((a, b) => {
            const priceA = a.prix_calcul ? parseInt(a.prix_calcul.replace(/\s/g, '')) : 0;
            const priceB = b.prix_calcul ? parseInt(b.prix_calcul.replace(/\s/g, '')) : 0;
            return priceA - priceB;
        });
    } else if (sortValue === 'desc') {
        currentProperties.sort((a, b) => {
            const priceA = a.prix_calcul ? parseInt(a.prix_calcul.replace(/\s/g, '')) : 0;
            const priceB = b.prix_calcul ? parseInt(b.prix_calcul.replace(/\s/g, '')) : 0;
            return priceB - priceA;
        });
    }

    // Retour page 1
    renderPage(1);
}




// 3. PAGINATION (Identique à ton code)
function renderPage(page) {
    currentPage = page;
    const container = document.getElementById('listing-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    if(!container) return; // Sécurité

    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    if (currentProperties.length === 0) {
        container.innerHTML = '<div style="text-align:center; width:100%; padding:50px;"><h3 style="color:white;">Aucun résultat pour ces critères.</h3><button onclick="document.getElementById(\'searchInput\').value=\'\'; document.getElementById(\'budgetRange\').value=5000000000; filterProperties();" style="margin-top:20px; padding:10px 20px; background:#D4AF37; border:none; cursor:pointer;">Réinitialiser la recherche</button></div>';
        return;
    }

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = currentProperties.slice(start, end);

    paginatedItems.forEach(p => {
        container.appendChild(createPropertyCard(p));
    });

    attachFormHandlers();
    renderPaginationButtons();
    // Scroll doux vers le haut de la liste
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function renderPaginationButtons() {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(currentProperties.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        const btnPrev = document.createElement('button');
        btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
        btnPrev.style.cssText = "padding:10px 15px; background:#fff; color:black; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
        btnPrev.onclick = () => renderPage(currentPage - 1);
        paginationContainer.appendChild(btnPrev);
    }

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) {
            btn.style.cssText = "padding:10px 15px; background:#D4AF37; color:black; border:none; font-weight:bold; margin:0 5px; border-radius:4px;";
        } else {
            btn.style.cssText = "padding:10px 15px; background:#fff; color:black; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
            btn.onclick = () => renderPage(i);
        }
        paginationContainer.appendChild(btn);
    }

    if (currentPage < totalPages) {
        const btnNext = document.createElement('button');
        btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnNext.style.cssText = "padding:10px 15px; background:#fff; color:black; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
        btnNext.onclick = () => renderPage(currentPage + 1);
        paginationContainer.appendChild(btnNext);
    }
}

// 4. DESIGN CARTE (TON DESIGN PRÉSERVÉ) ✨
function createPropertyCard(p) {
    const div = document.createElement('div');
    div.className = 'property-card';
    div.style.cssText = "background-color: #FFFFFF; border: 1px solid #ddd; overflow: hidden; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); transition: transform 0.3s ease;";

    let badgesHtml = '';
    if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
        badgesHtml += `<span style="position:absolute; top:15px; left:15px; background:#D4AF37; color:black; padding:6px 12px; font-weight:800; font-size:0.75rem; border-radius:4px; z-index:10; box-shadow: 0 2px 5px rgba(0,0,0,0.3); letter-spacing:1px;">💎 PRESTIGE</span>`;
    }
    if (p.categorie) {
        badgesHtml += `<span class="badge status" style="background:#000 !important; color:#FFFFFF !important; border:1px solid #D4AF37; position:absolute; top:10px; right:10px; padding:5px 10px; z-index:2; font-weight:bold; text-transform:uppercase; font-size:0.8rem; border-radius:4px;">${p.categorie}</span>`;
    }

    let featuresList = '';
    if (p.caracteristiques) {
        let cleanFeat = p.caracteristiques.replace(/\n/g, ',');
        const feats = cleanFeat.split(',').slice(0, 3); 
        featuresList = feats.map(f => 
            `<li style="color: #333; margin-bottom: 6px; display:flex; align-items:center; font-size:0.9rem;">
                <i class="fas fa-check" style="color:#D4AF37; margin-right:8px; font-size:0.8rem;"></i> ${f.trim()}
            </li>`
        ).join('');
    }

    div.innerHTML = `
        <div class="property-image" style="height:260px; position:relative; overflow:hidden;">
            ${badgesHtml}
            <a href="detail.html?id=${p.id}">
                <img src="${p.image}" alt="${p.titre}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='assets/images/default.jpg'">
            </a>
        </div>
        <div class="property-details" style="padding: 25px;">
            <h3 style="margin:0 0 10px 0;">
                <a href="detail.html?id=${p.id}" style="text-decoration:none; color: #111; font-family:'Playfair Display', serif; font-size:1.4rem;">${p.titre}</a>
            </h3>
            <p style="color:#666; font-size:0.95rem; margin-bottom:20px; display:flex; align-items:center;">
                <i class="fas fa-map-marker-alt" style="color:#D4AF37; margin-right:8px;"></i> ${p.ville}
            </p>
            <div style="display:flex; gap:20px; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee; color:#444;">
                <span title="Pièces"><i class="fas fa-door-open" style="color:#D4AF37;"></i> ${p.pieces} p.</span>
                <span title="Surface"><i class="fas fa-ruler-combined" style="color:#D4AF37;"></i> ${p.surface} m²</span>
            </div>
            <div style="color: #D4AF37; font-weight:800; font-size:1.5rem; margin-bottom:20px;">${p.prix}</div>
            <ul style="list-style:none; padding:0; margin-bottom:25px;">${featuresList}</ul>
            <div style="display:flex; gap:12px;">
                 <a href="detail.html?id=${p.id}" style="flex:1; text-align:center; padding:12px; background:white; border:1px solid #111; color:#111; text-decoration:none; font-weight:bold; font-size:0.9rem; transition:0.3s;" onmouseover="this.style.background='#111'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#111'">Voir détails</a>
                <button onclick="toggleForm('form-${p.id}')" style="flex:1; padding:12px; background:#D4AF37; color:black; border:none; font-weight:bold; cursor:pointer; font-size:0.9rem;">Contact</button>
            </div>
            <div id="form-${p.id}" style="display:none; margin-top:20px; background:#f9f9f9; padding:20px; border-radius:8px;">
                <form class="ajax-form" action="${FORMSPREE_ENDPOINT}" method="POST">
                    <input type="hidden" name="bien_ref" value="${p.id} - ${p.titre}">
                    <input type="text" name="nom" placeholder="Votre Nom" required style="width:100%; margin-bottom:10px; padding:10px; border:1px solid #ddd; border-radius:4px;">
                    <input type="tel" name="tel" placeholder="Téléphone" required style="width:100%; margin-bottom:10px; padding:10px; border:1px solid #ddd; border-radius:4px;">
                    <button type="submit" style="width:100%; background:#111; color:white; border:none; padding:10px; font-weight:bold; cursor:pointer;">ENVOYER LA DEMANDE</button>
                    <p class="form-status" style="display:none; color:green; margin-top:10px; text-align:center; font-size:0.9rem;"></p>
                </form>
            </div>
        </div>
    `;
    return div;
}

// 5. PARSEUR CSV (Identique)
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
            .then(r => { if (r.ok) { btn.innerText = "ENVOYÉ !"; btn.style.background = "green"; } else { status.innerText = "Erreur."; status.style.display='block'; btn.innerText="RÉESSAYER"; }})
            .catch(e => { status.innerText = "Erreur réseau."; status.style.display='block'; btn.innerText="RÉESSAYER"; });
        });
    });
}
