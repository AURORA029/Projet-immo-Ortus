/* LISTING.JS
 * Gestion du catalogue immobilier complet.
 * Inclus : Récupération Google Sheets, Filtrage dynamique (Smart Search), Pagination et Affichage.
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

// --- CONFIGURATION ---
const ITEMS_PER_PAGE = 9; 
let currentPage = 1;
let currentProperties = []; 
let allProperties = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
    
    // Initialisation des écouteurs d'événements (Filtres & Recherche)
    const budgetRange = document.getElementById('budgetRange');
    if(budgetRange) {
        budgetRange.addEventListener('input', () => filterProperties());
    }
    
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.addEventListener('click', () => filterProperties());
    }
    
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filterProperties();
        });
    }
});

/**
 * 1. CHARGEMENT DES DONNÉES & GESTION URL
 * Récupère le CSV, parse les données et applique les filtres initiaux si présents dans l'URL.
 */
async function fetchProperties() {
    const container = document.getElementById('listing-container');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        allProperties = csvToJSON(data); 
        
        // Gestion des paramètres URL (ex: venant de la page d'accueil)
        const urlParams = new URLSearchParams(window.location.search);
        const filterTexte = urlParams.get('filtre');
        const filterBudget = urlParams.get('budget');

        // Pré-remplissage de la barre de recherche
        if (filterTexte && filterTexte !== 'all') {
            const decodedTexte = decodeURIComponent(filterTexte).trim();
            const searchInput = document.getElementById('searchInput');
            if(searchInput) searchInput.value = decodedTexte;
        }

        // Pré-réglage du slider budget
        if (filterBudget) {
            const budgetRange = document.getElementById('budgetRange');
            if(budgetRange) budgetRange.value = filterBudget;
        }

        // Application immédiate des filtres
        filterProperties();

    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        if(container) container.innerHTML = '<p style="text-align:center; color:white;">Erreur de lecture des données.</p>';
    }
}

/**
 * 2. MOTEUR DE RECHERCHE & FILTRAGE
 * Filtre les biens selon 3 critères : Texte (Recherche intelligente), Prix et Catégorie.
 */
function filterProperties() {
    // A. Récupération des valeurs des inputs
    const inputEl = document.getElementById('searchInput');
    const textVal = inputEl ? inputEl.value.toLowerCase().trim() : '';

    const rangeEl = document.getElementById('budgetRange');
    const maxBudget = rangeEl ? parseInt(rangeEl.value) : 5000000000;

    const categoryEl = document.getElementById('categorySelect');
    const categoryVal = categoryEl ? categoryEl.value : 'all'; 
    
    // Mise à jour de l'affichage du budget
    const displayEl = document.getElementById('budgetDisplay');
    if(displayEl) {
        if(maxBudget >= 5000000000) displayEl.innerText = "Tout afficher";
        else displayEl.innerText = new Intl.NumberFormat('fr-FR').format(maxBudget) + " Ar";
    }

    // B. Application du filtre
    currentProperties = allProperties.filter(p => {
        
        // Critère 1 : Recherche Texte (Multi-mots)
        const searchTerms = textVal.split(' ');
        // Concaténation des champs pertinents pour la recherche
        const content = (p.ville + " " + p.titre + " " + p.type + " " + (p.description || "") + " " + (p.caracteristiques || "")).toLowerCase();
        // Vérification que tous les termes sont présents
        const matchText = searchTerms.every(term => content.includes(term));

        // Critère 2 : Prix
        const rawPrice = p.prix_calcul ? parseInt(p.prix_calcul.replace(/\s/g, '')) : 0;
        const matchPrice = (maxBudget >= 5000000000) || (rawPrice <= maxBudget);

        // Critère 3 : Catégorie (Vente/Location)
        const cat = p.categorie ? p.categorie.toLowerCase() : '';
        const matchCategory = (categoryVal === 'all') || cat.includes(categoryVal);

        return matchText && matchPrice && matchCategory;
    });

    // C. Tri des résultats
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

    // Réinitialisation à la page 1 après filtrage
    renderPage(1);
}

/**
 * 3. GESTION DE LA PAGINATION
 * Affiche les biens par lots (ex: 9 par page) et génère les boutons de navigation.
 * @param {number} page - Le numéro de page à afficher.
 */
function renderPage(page) {
    currentPage = page;
    const container = document.getElementById('listing-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    if(!container) return; 

    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    // Cas : Aucun résultat
    if (currentProperties.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; width:100%; padding:50px;">
                <h3 style="color:white;">Aucun résultat pour ces critères.</h3>
                <button onclick="document.getElementById('searchInput').value=''; document.getElementById('budgetRange').value=5000000000; filterProperties();" style="margin-top:20px; padding:10px 20px; background:#D4AF37; border:none; cursor:pointer;">Réinitialiser la recherche</button>
            </div>`;
        return;
    }

    // Découpage des données
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = currentProperties.slice(start, end);

    // Génération des cartes
    paginatedItems.forEach(p => {
        container.appendChild(createPropertyCard(p));
    });

    // Réattachement des gestionnaires de formulaires (car le DOM a changé)
    attachFormHandlers();
    
    // Génération des boutons de pagination
    renderPaginationButtons();
    
    // Scroll automatique vers le haut
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
        btnPrev.style.cssText = "padding:10px 15px; background:#fff; color:black; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
        btnPrev.onclick = () => renderPage(currentPage - 1);
        paginationContainer.appendChild(btnPrev);
    }

    // Boutons Numérotés
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

    // Bouton Suivant
    if (currentPage < totalPages) {
        const btnNext = document.createElement('button');
        btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnNext.style.cssText = "padding:10px 15px; background:#fff; color:black; border:none; cursor:pointer; margin:0 5px; border-radius:4px;";
        btnNext.onclick = () => renderPage(currentPage + 1);
        paginationContainer.appendChild(btnNext);
    }
}

/**
 * 4. GÉNÉRATION HTML DE LA CARTE
 * Crée le DOM pour un bien immobilier (Design Standard).
 * @param {Object} p - Données du bien.
 * @returns {HTMLElement} - La carte construite.
 */
function createPropertyCard(p) {
    const div = document.createElement('div');
    div.className = 'property-card';
    div.style.cssText = "background-color: #FFFFFF; border: 1px solid #ddd; overflow: hidden; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); transition: transform 0.3s ease;";

    // Gestion des badges
    let badgesHtml = '';
    if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
        badgesHtml += `<span style="position:absolute; top:15px; left:15px; background:#D4AF37; color:black; padding:6px 12px; font-weight:800; font-size:0.75rem; border-radius:4px; z-index:10; box-shadow: 0 2px 5px rgba(0,0,0,0.3); letter-spacing:1px;">💎 PRESTIGE</span>`;
    }
    if (p.categorie) {
        badgesHtml += `<span class="badge status" style="background:#000 !important; color:#FFFFFF !important; border:1px solid #D4AF37; position:absolute; top:10px; right:10px; padding:5px 10px; z-index:2; font-weight:bold; text-transform:uppercase; font-size:0.8rem; border-radius:4px;">${p.categorie}</span>`;
    }

    // Liste des caractéristiques (Max 3)
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

/**
 * 5. UTILITAIRES CSV ET FORMULAIRES
 */

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

// Affiche/Masque le formulaire de contact rapide
function toggleForm(id) { 
    const form = document.getElementById(id); 
    form.style.display = (form.style.display === 'none') ? 'block' : 'none'; 
}

// Gestion de l'envoi AJAX des formulaires (sans rechargement de page)
function attachFormHandlers() {
    const forms = document.querySelectorAll('.ajax-form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = form.querySelector('button');
            const status = form.querySelector('.form-status');
            const originalText = btn.innerText;
            
            btn.innerText = 'Envoi...';
            const data = new FormData(form);
            
            fetch(form.action, { 
                method: form.method, 
                body: data, 
                headers: { 'Accept': 'application/json' } 
            })
            .then(r => { 
                if (r.ok) { 
                    btn.innerText = "ENVOYÉ !"; 
                    btn.style.background = "green"; 
                } else { 
                    status.innerText = "Erreur."; 
                    status.style.display='block'; 
                    btn.innerText = originalText; 
                }
            })
            .catch(e => { 
                status.innerText = "Erreur réseau."; 
                status.style.display='block'; 
                btn.innerText = originalText; 
            });
        });
    });
}
