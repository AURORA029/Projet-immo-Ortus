// src/utils/googleSheets.js

// Ton URL d'export CSV Google Sheets
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_8KwzX3W0ONKYZray3wrDi5ReUBfw0-aSgvXSl7NaWNlvdSo9cKr3Y9Vh0k5kd_dHwchsCKfYE8d3/pub?output=csv";

export async function getProperties() {
    try {
        console.log("⏳ [BUILD] Aspiration des données depuis Google Sheets...");
        const response = await fetch(SHEET_CSV_URL);
        
        if (!response.ok) {
            throw new Error(`Erreur réseau HTTP: ${response.status}`);
        }
        
        const csvText = await response.text();
        const properties = csvToJSON(csvText);
        
        console.log(`✅ [BUILD] ${properties.length} biens immobiliers chargés avec succès.`);
        return properties;
        
    } catch (error) {
        console.error("❌ [ERREUR CRITIQUE] Impossible de lire le Google Sheet :", error);
        return []; // Fallback : on renvoie un tableau vide pour ne pas faire crasher le build
    }
}

// Ta fonction utilitaire adaptée pour le moteur Astro
function csvToJSON(csvText) {
    const lines = [];
    let newLine = '';
    let inQuote = false;
    
    // Parsing caractère par caractère pour gérer les virgules dans les descriptions
    for (let i = 0; i < csvText.length; i++) {
        let char = csvText[i];
        if (char === '"') inQuote = !inQuote;
        if (char === '\n' && !inQuote) { 
            lines.push(newLine); 
            newLine = ''; 
        } 
        else { 
            newLine += char; 
        }
    }
    if (newLine) lines.push(newLine);
    if (lines.length < 2) return []; 
    
    // Nettoyage des en-têtes (headers)
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Transformation des lignes en objets JSON
    return lines.slice(1).map(line => {
        const values = [];
        let currentVal = '';
        let inQuoteVal = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') { inQuoteVal = !inQuoteVal; continue; }
            if (char === ',' && !inQuoteVal) { 
                values.push(currentVal.trim()); 
                currentVal = ''; 
            } 
            else { 
                currentVal += char; 
            }
        }
        values.push(currentVal.trim());
        
        let obj = {};
        headers.forEach((header, i) => { 
            obj[header] = values[i] || ''; 
        });
        
        return obj;
    }).filter(item => item.id && item.id.trim() !== ""); // Sécurité: Ignore les lignes vides sans ID
}