/* * LISTING.JS - LE CERVEAU FINAL 🧠
 * Connecté au Google Sheet "Ortus-BackOffice"
 * Gère : Affichage, Recherche (Accueil + Locale), Vidéos, Garage, Formspree
 */

// TA CONFIGURATION
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

let allProperties = []; // Mémoire du site

document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
});

// 1. RÉCUPÉRATION ET ANALYSE
async function fetchProperties() {
    const container = document.getElementById('listing-container');
    
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Conversion CSV -> Objets Javascript
        allProperties = csvToJSON(data);
        
        // Vérification : Est-ce qu'on vient de l'accueil avec une recherche ?
        const urlParams = new URLSearchParams(window.location.search);
        const filterFromHome = urlParams.get('filtre'); // ex: ?filtre=Ivandry

        if (filterFromHome && filterFromHome !== 'all') {
            // Oui ! On remplit la barre de recherche et on filtre
            const searchInput = document.getElementById('searchInput');
            if(searchInput) searchInput.value = filterFromHome; // On affiche le mot cherché
            
            filterProperties(filterFromHome); // On lance le filtre
        } else {
            // Non, on affiche tout par défaut
            displayProperties(allProperties);
        }

    } catch (error) {
        console.error('Erreur chargement:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Impossible de charger les biens. Vérifiez la connexion.</p>';
    }
}

// 2. MOTEUR DE RECHERCHE (Appelé par le bouton ou l'URL)
function filterProperties(query = null) {
    // Si pas de requête directe, on prend celle de la barre de recherche
    const inputVal = query || document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allProperties.filter(p => {
        // Recherche large : Titre OU Ville OU Type OU Description
        return (p.ville && p.ville.toLowerCase().includes(inputVal)) ||
               (p.titre && p.titre.toLowerCase().includes(inputVal)) ||
               (p.type && p.type.toLowerCase().includes(inputVal));
    });
    
    displayProperties(filtered);
}

// 3. AFFICHAGE DES CARTES (C'est ici qu'on "dessine" le HTML)
function displayProperties(properties) {
    const container = document.getElementById('listing-container');
    container.innerHTML = ''; // On vide avant de remplir

    if (properties.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:white; width:100%;">Aucun bien ne correspond à votre recherche.</p>';
        return;
    }

    properties.forEach(p => {
        const card = createPropertyCard(p);
        container.appendChild(card);
    });

    attachFormHandlers(); // On réactive les formulaires après l'affichage
}

// 4. CRÉATION D'UNE CARTE UNIQUE (Design & Logique)
function createPropertyCard(p) {
    const div = document.createElement('div');
    div.className = 'property-card';
    
    // --- Logique des Badges ---
    let badgesHtml = '';
    // Badge "Prestige" (colonne 'gamme')
    if (p.gamme && p.gamme.toLowerCase().includes('prestige')) {
        badgesHtml += `<span class="badge" style="background:#D4AF37; color:#000; box-shadow:0 0 10px #D4AF37;">💎 PRESTIGE</span>`;
    }
    // Badge "Vente/Location" (colonne 'categorie')
    if (p.categorie) {
        // On décale le badge catégorie si Prestige est déjà là
        let top = p.gamme && p.gamme.toLowerCase().includes('prestige') ? '40px' : '10px';
        badgesHtml += `<span class="badge status" style="top:${top};">${p.categorie}</span>`;
    }

    // --- Logique Garage (colonne 'stationnement') ---
    let garageHtml = '';
    if (p.stationnement && p.stationnement.length > 0 && p.stationnement !== '0') {
        garageHtml = `<span><i class="fas fa-car" style="color:#D4AF37;"></i> ${p.stationnement}</span>`;
    }

    // --- Logique Vidéo (colonne 'video') ---
    let videoBtn = '';
    if (p.video && p.video.startsWith('http')) {
        videoBtn = `
        <a href="${p.video}" target="_blank" class="btn-video" 
           style="display:flex; align-items:center; justify-content:center; gap:10px; margin-top:10px; 
                  color:#D4AF37; border:1px solid #D4AF37; padding:8px; border-radius:4px; text-decoration:none; transition:0.3s;">
           <i class="fas fa-play-circle"></i> VISITE VIDÉO
        </a>`;
    }

    // --- Liste des atouts (colonne 'caracteristiques') ---
    let featuresList = '';
    if (p.caracteristiques) {
        const feats = p.caracteristiques.split(',').slice(0, 3); // Max 3 atouts
        featuresList = feats.map(f => `<li><i class="fas fa-check" style="color:#D4AF37;"></i> ${f.trim()}</li>`).join('');
    }

    // --- Construction du HTML ---
    div.innerHTML = `
        <div class="property-image">
            ${badgesHtml}
            <img src="${p.image}" alt="${p.titre}" onerror="this.src='assets/images/default.jpg'">
        </div>
        <div class="property-details">
            <h3 style="margin-bottom:5px;">${p.titre}</h3>
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
            
            ${videoBtn}

            <button class="btn-contact-card" onclick="toggleForm('form-${p.id}')" 
                    style="width:100%; padding:12px; background:#020610; color:white; border:1px solid #333; margin-top:10px; cursor:pointer;">
                Ce bien m'intéresse
            </button>

            <div id="form-${p.id}" class="card-form" style="display:none; margin-top:15px; background:#111; padding:15px; border-radius:5px; border:1px solid #333;">
                <form class="ajax-form" action="${FORMSPREE_ENDPOINT}" method="POST">
                    <input type="hidden" name="bien_ref" value="${p.id} - ${p.titre}">
                    <input type="hidden" name="_subject" value="Intérêt pour : ${p.titre}">
                    
                    <input type="text" name="nom" placeholder="Votre Nom" required style="width:100%; margin-bottom:10px; padding:8px; background:#222; border:none; color:white;">
                    <input type="tel" name="tel" placeholder="Votre Téléphone" required style="width:100%; margin-bottom:10px; padding:8px; background:#222; border:none; color:white;">
                    <input type="email" name="email" placeholder="Votre Email" required style="width:100%; margin-bottom:10px; padding:8px; background:#222; border:none; color:white;">
                    
                    <button type="submit" style="width:100%; background:#D4AF37; border:none; padding:10px; color:black; font-weight:bold; cursor:pointer;">ENVOYER</button>
                    <p class="form-status" style="display:none; color:#D4AF37; text-align:center; margin-top:5px; font-size:0.9rem;"></p>
                </form>
            </div>
        </div>
    `;
    return div;
}

// 5. UTILITAIRES TECHNIQUES
function csvToJSON(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
        // Regex complexe pour gérer les virgules DANS les colonnes (ex: description)
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const simpleValues = line.split(','); // Fallback

        let obj = {};
        headers.forEach((header, i) => {
            let val = (values[i] || simpleValues[i] || '').replace(/^"|"$/g, '').trim(); 
            obj[header] = val;
        });
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
            e.preventDefault(); // STOP page blanche
            
            const btn = form.querySelector('button[type="submit"]');
            const status = form.querySelector('.form-status');
            const originalText = btn.innerText;

            btn.innerText = 'Envoi...';
            btn.disabled = true;

            const data = new FormData(form);

            fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    window.location.href = 'merci.html'; // SUCCÈS -> Redirection
                } else {
                    status.innerText = "Erreur d'envoi.";
                    status.style.display = 'block';
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            }).catch(error => {
                status.innerText = "Problème de connexion.";
                status.style.display = 'block';
                btn.innerText = originalText;
                btn.disabled = false;
            });
        });
    });
}
