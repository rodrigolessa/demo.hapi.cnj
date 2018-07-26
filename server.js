'use strict';

const Bcrypt = require('bcrypt');

const Hapi = require('hapi');

const users = {
    john: {
        username: 'rlessa',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'Rodrigo Lessa',
        id: '2133d32a'
    }
};

const validate = async (request, username, password) => {

    const user = users[username];
    if (!user) {
        return { credentials: null, isValid: false };
    }

    const isValid = await Bcrypt.compare(password, user.password);
    const credentials = { id: user.id, name: user.name };

    return { isValid, credentials };
};

const server = Hapi.server({
    port: 3001,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    options: {
        auth: 'simple'
    },
    handler: (request, h) => {

        return 'Validate CNJ!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        // request.log(['a', 'name'], "Request name");
        // or
        request.logger.info('In handler %s', request.path);

        return 'CNJ: ' + encodeURIComponent(request.params.name) + '!';
    }
});

server.route({
    method: 'GET',
    path: '/help',
    handler: (request, h) => {

        return h.file('/help.html');
    }
});

const init = async () => {

    await server.register(require('hapi-auth-basic'));

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: ['response']
        }
    });

    server.auth.strategy('simple', 'basic', { validate });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

//Note that we URI encode the name parameter, this is to prevent content injection attacks. Remember, it's never a good idea to render user provided data without output encoding it first!
process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();