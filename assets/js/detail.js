/* DETAIL.JS
 * Gestion de l'affichage d'un bien unique (Fiche Produit).
 * Inclus : Parsing des paramètres URL, affichage des détails, galerie photo et formulaire de contact.
 */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

document.addEventListener('DOMContentLoaded', () => {
    fetchPropertyDetail();
});

/**
 * Récupère l'ID dans l'URL et charge les données correspondantes depuis le Google Sheet.
 */
async function fetchPropertyDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) return;

    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const properties = csvToJSON(data);
        
        const property = properties.find(p => p.id === id);

        if (property) {
            displayDetail(property);
        }
    } catch (error) {
        console.error("Erreur lors du chargement du détail :", error);
    }
}

/**
 * Injecte les données du bien dans le DOM.
 * @param {Object} p - L'objet contenant les informations du bien.
 */
function displayDetail(p) {
    // Mise à jour des balises de base
    document.title = `${p.titre} - ORTUS`;
    document.getElementById('detail-title').innerText = p.titre;
    document.getElementById('detail-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${p.ville} - ${p.categorie}`;
    document.getElementById('detail-price').innerText = p.prix;
    document.getElementById('detail-desc').innerText = p.description;

    // Image Principale
    document.getElementById('detail-image').innerHTML = `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;" alt="${p.titre}">`;

    // Gestion du lien Vidéo
    let videoLink = p.video ? p.video.trim() : '';
    if (videoLink && videoLink.startsWith('http')) {
        document.getElementById('detail-video').innerHTML = `
            <a href="${videoLink}" target="_blank" style="display:block; background:#D4AF37; color:black; text-align:center; padding:15px; margin-top:10px; text-decoration:none; font-weight:bold; border-radius:5px;">
                <i class="fas fa-play-circle"></i> REGARDER LA VIDÉO
            </a>`;
    }

    // Caractéristiques techniques (Specs)
    document.getElementById('detail-specs').innerHTML = `
        <div class="tech-spec"><i class="fas fa-door-open" style="color:#D4AF37;"></i> ${p.pieces} Pièces</div>
        <div class="tech-spec"><i class="fas fa-ruler-combined" style="color:#D4AF37;"></i> ${p.surface} m²</div>
        <div class="tech-spec"><i class="fas fa-home" style="color:#D4AF37;"></i> ${p.type}</div>
    `;

    // Liste des atouts
    if (p.caracteristiques) {
        let cleanFeats = p.caracteristiques.replace(/\n/g, ',');
        const feats = cleanFeats.split(',');
        const featsHTML = feats.map(f => `<li style="margin-bottom:10px;"><i class="fas fa-check" style="color:#D4AF37; margin-right:10px;"></i>${f.trim()}</li>`).join('');
        document.getElementById('detail-features').innerHTML = featsHTML;
    }

    // --- Gestion de la Galerie d'images ---
    initGallery(p);

    // --- Initialisation du Formulaire ---
    initContactForm(p);
}

/**
 * Génère la grille d'images et configure la Lightbox.
 */
function initGallery(p) {
    const gallerySection = document.getElementById('gallery-section');
    const galleryGrid = document.getElementById('gallery-grid');

    // Vérification de l'existence de la galerie
    if (p.galerie && p.galerie.trim() !== "") {
        gallerySection.style.display = 'block'; 
        galleryGrid.innerHTML = ''; 

        const images = p.galerie.split(',');

        images.forEach(imgUrl => {
            const cleanUrl = imgUrl.trim();
            if(cleanUrl.length > 5) { 
                const img = document.createElement('img');
                img.src = cleanUrl;
                
                // Styles inline conservés pour compatibilité immédiate sans fichier CSS externe
                img.style.cssText = "width: 100%; height: 200px; object-fit: cover; border-radius: 8px; cursor: pointer; transition: transform 0.3s; border: 1px solid #333;";
                
                // Interaction
                img.onmouseover = function() { this.style.transform = 'scale(1.03)'; };
                img.onmouseout = function() { this.style.transform = 'scale(1)'; };

                // Ouverture Lightbox
                img.onclick = function() {
                    const lightbox = document.getElementById('lightbox');
                    const lightboxImg = document.getElementById('lightbox-img');
                    if(lightbox && lightboxImg) {
                        lightboxImg.src = cleanUrl;
                        lightbox.style.display = 'flex';
                    }
                };

                galleryGrid.appendChild(img);
            }
        });
    } else {
        if(gallerySection) gallerySection.style.display = 'none';
    }
}

/**
 * Configure le formulaire de contact spécifique au bien.
 */
function initContactForm(p) {
    const formContainer = document.getElementById('detail-form-container');
    if (!formContainer) return;

    formContainer.innerHTML = `
        <form id="contact-form" action="${FORMSPREE_ENDPOINT}" method="POST" style="display:flex; flex-direction:column; gap:10px;">
            <input type="hidden" name="sujet" value="Intérêt pour : ${p.titre} (ID: ${p.id})">
            <input type="text" name="nom" placeholder="Votre Nom" required style="padding:15px; border:none; border-radius:5px;">
            <input type="tel" name="tel" placeholder="Votre Téléphone" required style="padding:15px; border:none; border-radius:5px;">
            <input type="email" name="email" placeholder="Votre Email" required style="padding:15px; border:none; border-radius:5px;">
            <button type="submit" id="btn-submit" style="padding:15px; background:#D4AF37; border:none; cursor:pointer; font-weight:bold; border-radius:5px;">ENVOYER</button>
            <p id="form-status" style="display:none; color:white; text-align:center; margin:0;"></p>
        </form>
    `;

    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const btn = document.getElementById('btn-submit');
        const status = document.getElementById('form-status');
        const originalText = btn.innerText;

        btn.innerText = "Envoi en cours...";
        btn.disabled = true;

        const data = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Redirection ou message de succès
                window.location.href = "merci.html"; 
            } else {
                throw new Error('Erreur serveur');
            }
        } catch (error) {
            status.style.display = 'block';
            status.innerText = "Une erreur est survenue. Veuillez réessayer.";
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// Fonction utilitaire CSV
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
