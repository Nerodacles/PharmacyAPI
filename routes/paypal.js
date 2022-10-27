let express = require('express');
let router = express.Router();
let paypal = require("paypal-rest-sdk");
let drugService = require('../services/drugService');

paypal.configure({
    mode: "sandbox",
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET 
});

router.get("/success", function(req, res, next){
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response)
            throw error
        } else {
            res.send(JSON.stringify(payment))
        }
    })
})

router.get("/cancel", function(req, res, next){
    res.sendStatus(400)
})

router.post('/', async function(req, res, next) {
    let floatDOP = 0.019

    if (req.body.items){
        var items = req.body.items
        for (let item of items){
            let drug = await drugService.getDrug(item.id)
            item.price = (drug.price * floatDOP).toFixed(2)
            item.name = drug.name
            item.description = drug.description
            item.currency = "USD"
            delete item.id
        }
    }

    let totalAmount = items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "https://pharmacy.jmcv.codes/paypal/success",
            cancel_url: "https://pharmacy.jmcv.codes/paypal/cancel"
        },
        transactions: [
            {
                item_list: {items: items},
                amount: {
                    currency: "USD",
                    total: totalAmount
                },
                description: "Pago por los medicamentos mediante PharmacyAPP."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            res.send({link: payment.links[1].href})
        }
    })
})

module.exports = router;