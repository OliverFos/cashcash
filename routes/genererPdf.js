// Ajout des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');
const puppeteer = require('puppeteer');

// Fonction pour récupérer les données d'une intervention en fonction de son numéro
const fetchInterventionData = (numInter) => {
    const interventionQuery = "SELECT * FROM intervention WHERE numIntervention = ?";
    return new Promise((resolve, reject) => {
        db.query(interventionQuery, [numInter], (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
};

// Fonction pour récupérer les numéros de série des matériels associés à une intervention
const fetchReparerData = (numInter) => {
    const reparerQuery = "SELECT numSerie FROM reparer WHERE numIntervention = ?";
    return new Promise((resolve, reject) => {
        db.query(reparerQuery, [numInter], (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
};

// Gérer les requêtes GET à la racine '/'
router.get('/', async (req, res) => {
    // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        // Extraire le numéro d'intervention des paramètres de requête
        const numInter = req.query.numInter;

        try {
            // Récupérer les données de l'intervention en utilisant la fonction fetchInterventionData
            const interventionData = await fetchInterventionData(numInter);

            // Récupérer les numéros de série des matériels associés à l'intervention en utilisant la fonction fetchReparerData
            const reparerData = await fetchReparerData(numInter);

            //console.log(interventionData);
            // console.log(reparerData);

            // Lancer le navigateur Puppeteer
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            // Utiliser les données pour générer le contenu PDF
            const pdfContent = `
               <style>
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    font-size: 14px;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }

                p {
                    margin: 0 0 10px;
                }

                h2 {
                    font-size: 24px;
                    margin-bottom: 20px;
                }

                ul {
                    padding-left: 20px;
                    list-style-type: disc;
                }

                li {
                        margin-bottom: 5px;
                }
                </style>
                <p>Numéro technicien: ${interventionData[0].numMatr}</p>
                <p>Date intervention: ${interventionData[0].dateIntervention}</p>
                <p>Heure intervention: ${interventionData[0].heureIntervention}</p>
                <p>Numéro client: ${interventionData[0].numClient}</p>
                <p>Numéro intervention: ${interventionData[0].numIntervention}</p>

                <h2>Matériaux à réparer:</h2>
                <ul>
                    ${reparerData.map(item => `<li>${item.numSerie}</li>`).join('')}
                    
                </ul>
            `;
            console.log(reparerData);

            
            // Définir le contenu de la page PDF et générer le PDF
            await page.setContent(pdfContent);
            await page.pdf({ path: 'intervention' + interventionData[0].numIntervention + '.pdf', format: 'A4' });

            // Fermer le navigateur Puppeteer
            await browser.close();

            // Télécharger le PDF généré
            res.download('intervention' + interventionData[0].numIntervention + '.pdf');
        } catch (error) {
            // En cas d'erreur, afficher l'erreur dans la console et renvoyer une réponse avec un statut d'erreur
            console.error(error);
            res.status(500).send('Error generating PDF');
        }
    } else {
        // Si l'utilisateur n'a pas les autorisations nécessaires, le rediriger vers la racine '/'
        res.redirect("/");
    }
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;
