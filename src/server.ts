import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyJwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import path from 'path';
import { router } from '../routes/router';

const app = fastify();


// CORS
await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});


// JWT
await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string
});


// AUTENTICAÇÃO
app.decorate('authenticate', async function(request: any, reply: any) {
    try {
        await request.jwtVerify();
    } catch (erro) {
        return reply.status(401).send({
            error: 'Token inválido ou ausente'
        });
    }
});


// MULTIPART
await app.register(fastifyMultipart);


// ARQUIVOS ESTÁTICOS
await app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
});


// ROTAS
await app.register(router);


// SERVIDOR
app.listen(
    {
        port: 3333
    },
    (err, address) => {

        if (err) {
            console.log(err);
            process.exit(1);
        }

        console.log(`Servidor rodando em ${address}`);
    }
);