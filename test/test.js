const chai     = require('chai');
const chaiHttp = require('chai-http');
const app      = require ('../index');
const User     = require('../models/User');
const Room     = require('../models/Room');
const axios    = require('axios');
const {Status} = require ('../utils/constants');
const assert   = chai.assert;
var expect     = chai.expect

// Configure chai
chai.use(chaiHttp);
chai.should();
let user1 = {
    name: "Json",
    email: "json@gmail.com",
    password: "123456",
    company: "COLA"
}

let user2 = {
    name: "alice",
    email: "alice@gmail.com",
    password: "123456",
    company: "COLA"
}

let user3 = {
    name: "bob",
    email: "bob@gmail.com",
    password: "123456",
    company: "PEPSI"
}

let user4 = {
    name: "jessica",
    email: "jessica@gmail.com",
    password: "123456",
    company: "COLA"
}

let arrayUsers= [user1, user2, user3, user4]
let tokens = []

let room1 = {
    "start": "1617876000",
    "end": "1617877800",
    "resource": "CO2",
    "eventName": "koko"
}
/*
describe("test###", () => {
    before(async () => {
        await User.deleteMany({});
        await Room.deleteMany({});
    });

    
    describe('/POST register', () => {
        it('it should fail registering user1', async () => {
            for(const usr of arrayUsers){
                console.log(usr)
                let results =  await registerUsr(usr)//await doJob(1,1);
                results.should.have.status(200);
                results.body.should.be.a('object');
                results.body.data.should.have.property('name');
                results.body.data.should.have.property('email');
                results.body.data.should.have.property('company');
                results.body.data.should.have.property('address');
                
            }

        }).timeout(22000)

    });

    describe('/POST register', () => {
        it('it should fail registering user1', async () => {
            let res =  await registerUsr(user1);
            res.should.have.status(200);
            res.body.errortext.should.be.eql('Email already exists');
        })
    });

    describe('/POST login', () => {
        it('it should login users', async () => {
            for(const usr of arrayUsers){
                let results =  await loginUser(usr)//await doJob(1,1);
                tokens.push(results.body.data.token)
                results.should.have.status(200);
                results.body.should.be.a('object');
                results.body.data.should.have.property('token');
                results.body.data.should.have.property('token');
                results.body.data.user.should.have.property('name');
                results.body.data.user.should.have.property('email');
                results.body.data.user.should.have.property('company');
                results.body.data.user.should.have.property('address');

            }
        })
    });

    describe('/POST book', () => {
        it('it should book for user1 ', async () => {
            console.log(tokens)
            let result = await book(room1, 0)
            console.log(result.body.errortext)
            result.should.have.status(200);
            let myRoom = await Room.findOne({company:  user1.company, status: Status.Booked, start: room1.start, end: room1.end, resourceId: room1.resource});
            assert.notEqual(myRoom, null);

        })
    });

    describe('/POST cancel', () => {
        it('it should cancel for user1 ', async () => {
            console.log(tokens)
            let result = await cancel(room1, 0)
            console.log(result.body.errortext)
            result.should.have.status(200);
            let myRoom = await Room.findOne({company:  user1.company, status: Status.Canceled, start: room1.start, end: room1.end, resourceId: room1.resource});
            assert.notEqual(myRoom, null);

        })
    });

});

*/


function registerUsr(usr){
    return new Promise((resolve) => {
        chai.request(app)
            .post('/api/register')
            .send(usr)
            .then( (res) => {
                resolve(res)

            })
            .catch( (err)  => {
                throw err;
            });
    })
}

function loginUser(usr){
    return new Promise((resolve) => {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": usr.email,
                "password": usr.password
            })
            .then( (res) => {
                resolve(res)

            })
            .catch( (err)  => {
                throw err;
            });
    })
}

function book(room, indexUsr){
    return new Promise((resolve) => {
        chai.request(app)
            .post('/api/room/book')
            .set('auth-token', tokens[indexUsr])
            .send(room)
            .then( (res) => {
                resolve(res)

            })
            .catch( (err)  => {
                throw err;
            });
    })
}

function cancel(room, indexUsr){
    return new Promise((resolve) => {
        chai.request(app)
            .post('/api/room/cancel')
            .set('auth-token', tokens[indexUsr])
            .send(room)
            .then( (res) => {
                resolve(res)

            })
            .catch( (err)  => {
                throw err;
            });
    })
}

