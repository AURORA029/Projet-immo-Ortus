/* DETAIL.JS - Affiche un seul bien */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzklrl"; 

document.addEventListener('DOMContentLoaded', () => {
    fetchPropertyDetail();
});

async function fetchPropertyDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) return;

    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const properties = csvToJSON(data); // Utilise le convertisseur intelligent
        
        const property = properties.find(p => p.id === id);

        if (property) {
            displayDetail(property);
        }
    } catch (error) {
        console.error(error);
    }
}

function displayDetail(p) {
    document.title = `${p.titre} - ORTUS`;
    document.getElementById('detail-title').innerText = p.titre;
    document.getElementById('detail-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${p.ville} - ${p.categorie}`;
    document.getElementById('detail-price').innerText = p.prix;
    document.getElementById('detail-desc').innerText = p.description;

    // Image
    document.getElementById('detail-image').innerHTML = `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;">`;

    // Vidéo
    let videoLink = p.video ? p.video.trim() : '';
    if (videoLink && videoLink.startsWith('http')) {
        document.getElementById('detail-video').innerHTML = `
            <a href="${videoLink}" target="_blank" style="display:block; background:#D4AF37; color:black; text-align:center; padding:15px; margin-top:10px; text-decoration:none; font-weight:bold; border-radius:5px;">
                <i class="fas fa-play-circle"></i> REGARDER LA VIDÉO
            </a>`;
    }

    // Specs
    document.getElementById('detail-specs').innerHTML = `
        <div class="tech-spec"><i class="fas fa-door-open" style="color:#D4AF37;"></i> ${p.pieces} Pièces</div>
        <div class="tech-spec"><i class="fas fa-ruler-combined" style="color:#D4AF37;"></i> ${p.surface} m²</div>
        <div class="tech-spec"><i class="fas fa-home" style="color:#D4AF37;"></i> ${p.type}</div>
    `;

    // Atouts (Nettoyage + Affichage)
    if (p.caracteristiques) {
        let cleanFeats = p.caracteristiques.replace(/\n/g, ',');
        const feats = cleanFeats.split(',');
        const featsHTML = feats.map(f => `<li style="margin-bottom:10px;"><i class="fas fa-check" style="color:#D4AF37; margin-right:10px;"></i>${f.trim()}</li>`).join('');
        document.getElementById('detail-features').innerHTML = featsHTML;
    }

    // Formulaire
    document.getElementById('detail-form-container').innerHTML = `
        <form action="${FORMSPREE_ENDPOINT}" method="POST" style="display:flex; flex-direction:column; gap:10px;">
            <input type="hidden" name="sujet" value="Intérêt pour : ${p.titre}">
            <input type="text" name="nom" placeholder="Votre Nom" required style="padding:15px; border:none; border-radius:5px;">
            <input type="tel" name="tel" placeholder="Votre Téléphone" required style="padding:15px; border:none; border-radius:5px;">
            <input type="email" name="email" placeholder="Votre Email" required style="padding:15px; border:none; border-radius:5px;">
            <button type="submit" style="padding:15px; background:#D4AF37; border:none; cursor:pointer; font-weight:bold; border-radius:5px;">ENVOYER</button>
        </form>
    `;
}

// LE PARSEUR INTELLIGENT (OBLIGATOIRE)
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
