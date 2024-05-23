var express = require('express');
const router = express.Router();
const connection = require('../connect');
const session = require('express-session');

router.get('/', function(req, res, next) {
    if (req.session.email && req.session.typeSal){
        if(req.session.typeSal == 1){
            res.render('RechIntervention');
    } else {
        res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
});

router.post('/', (req, res) => {
    const select = req.body.select;
    const info = req.body.info;
    if(select == 'agent'){
        const sql = "SELECT * FROM intervention WHERE intervention.numMatr = ?";
        connection.query(sql,info, (err, data) =>{
            if(data.length == 0){
                res.render('RechIntervention', {message : "Les interventions que vous recherchez n'existe pas"});
            }else{
                res.render('RechIntervention', {interData: data });
            }
        })
    }

    if (select == 'date'){
        const sql = "SELECT * FROM intervention WHERE intervention.dateIntervention = ?";
        connection.query(sql,info, (err, data) =>{
            //if(err) throw err;
            if (err){
                res.render('RechIntervention', {message : "Les interventions que vous recherchez n'existe pas"});
            } else{
                res.render('RechIntervention', {interData: data });
            }
    })
    }
})

module.exports = router;
