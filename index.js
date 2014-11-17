var port = process.env.PORT;
var db = process.env.DB;
var Hapi = require('hapi');
var Good = require('good');
var Joi = require('joi');
var server = new Hapi.Server(port);

var mongoose = require('mongoose');
mongoose.connect(db);

var Cat = mongoose.model('Cat', { name: String, age: Number, gender: String });

//var kitty = new Cat({ name: 'Vladimir' });
//kitty.save(function (err) {
//    if (err) // ...
//        console.log('meow');
//});


server.route({
    config: {
        description: 'this is the home page route',
        notes: 'these are my sweet, sweet notes',
        tags: ['home', 'routes', 'docs']
    },
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + request.params.name + '!' + request.query.limit);
    },
    config: {
        description: 'this is the user name route',
        notes: 'these are my sweet, sweet notes',
        tags: ['user', 'routes', 'docs'],
        validate: {
            params: {
                name: Joi.string().min(3).max(7)
            },
            query: {
                limit: Joi.number().required().min(9)
            }
        }
    }
});

server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});

server.route({
    method: 'POST',
    path: '/cats',
    handler: function(request, reply) {
        var kitty = new Cat(request.payload);
        kitty.save(function () {
            reply(kitty);
        });
    }
});

server.pack.register(
    [
        {
            plugin: Good,
            options: {
                reporters: [{
                    reporter: require('good-console'),
                    args:[{ log: '*', request: '*' }]
                }]
            }
        },
        { plugin: require('lout') }
    ], function (err) {
        if (err) {
            throw err; // something bad happened loading the plugin
        }

        server.start(function () {
            server.log('info', 'Server running at: ' + server.info.uri);
        });
    }
);

