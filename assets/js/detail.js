// 1. On récupère l'ID dans l'URL (ex: detail.html?id=1)
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// 2. On cherche le bien correspondant dans notre "base de données" (le fichier datas.js)
// On utilise 'find' pour trouver l'élément qui a le même ID
const bien = biensImmobiliers.find(b => b.id == id);

// 3. Si on a trouvé le bien, on remplit la page HTML
if (bien) {
    // Remplissage des Textes simples
    document.getElementById('detail-title').innerText = bien.titre;
    document.getElementById('detail-price').innerText = bien.prix;
    document.getElementById('detail-location').innerText = bien.ville;
    document.getElementById('detail-badge').innerText = bien.badge;
    
    // Remplissage des caractéristiques
    document.getElementById('detail-lits').innerText = bien.lits + ' Lits';
    document.getElementById('detail-bains').innerText = bien.bains + ' SdB';
    document.getElementById('detail-surface').innerText = bien.surface;
    
    // Gestion du Garage (s'il existe dans le HTML)
    const garageElement = document.getElementById('detail-garage');
    if (garageElement) {
        garageElement.innerText = bien.garage;
    }

    // Remplissage de l'Image (on change l'attribut SRC)
    document.getElementById('detail-image').src = bien.image;
    document.getElementById('detail-image').alt = bien.titre;

    // Remplissage de la Description (innerHTML pour que les <br> fonctionnent)
    document.getElementById('detail-description').innerHTML = bien.description;

    // Gestion des couleurs du badge (Vente = Bleu, Location = Foncé)
    const badge = document.getElementById('detail-badge');
    if (bien.badge === "Vente") {
        badge.className = "badge badge-sale"; // Classe CSS bleue
    } else {
        badge.className = "badge badge-rent"; // Classe CSS sombre
    }

} else {
    // 4. Si l'ID n'existe pas (ex: id=999), on redirige vers l'accueil ou on affiche un message
    document.querySelector('.property-grid-layout').innerHTML = "<h1>Oups ! Ce bien n'existe pas ou plus.</h1> <a href='index.html'>Retour à l'accueil</a>";
}
