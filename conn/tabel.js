"use strict";
var connection = require('../conn/conn');
var err=''
// var apipabrik='http://192.168.10.11:8011/'
// var apibandung='http://192.168.10.11:8009/'
// var ipsimpanfhoto = '\\\\192.168.20.2\\Program_Holis'
// var fileurlaset = 'fhoto\\asset\\'

function queryDB(query, queryvalue) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            connection.query(query, queryvalue, function (error, rows, fields) {
                if (error) {
                    err = "Error mysql -> " + error + " <- " + this.sql
                    reject(err)
                } else { 
                     //console.log(this.sql)
                    resolve({
                        rows,
                        fields
                    })
                }
            })
        }, 0);
    })
}

function dumpError(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message)
        }
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log(err);
    }
}

async function starttransaction(){
    await queryDB('START TRANSACTION','')
    .then(async function(){})
}

async function commit(){
    await queryDB('COMMIT','')
    .then(async function(){})
}

async function rollback(){
    await queryDB('ROLLBACK','')
    .then(async function(){})
}

function dateTimeToMYSQL(datx) {
    var d = new Date(datx),
        month = '' + (d.getMonth() + 1),
        day = d.getDate().toString(),
        year = d.getFullYear(),
        hours = d.getHours().toString(),
        minutes = d.getMinutes().toString(),
        secs = d.getSeconds().toString();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    if (secs.length < 2) secs = '0' + secs;
    return [year, month, day].join('-')
    // + ' ' + [hours, minutes, secs].join(':');
}

function GetError(e) {
    dumpError(e)
    let error = e.toString()
    error.substr(0, 11) === "Error mysql" ? error = e : error = e.message
    return error 
}



module.exports = {
    queryDB : queryDB,
    starttransaction : starttransaction,
    commit : commit,
    rollback : rollback,
    dumpError : dumpError,
    dateTimeToMYSQL : dateTimeToMYSQL,
    // apibandung :apibandung,
    // ipsimpanfhoto:ipsimpanfhoto,
    // fileurlaset:fileurlaset,
    GetError:GetError,
};
