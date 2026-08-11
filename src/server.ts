import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyJwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { router } from '../routes/router';

const app = fastify();

app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string
});

app.decorate('authenticate', async function(request: any, reply: any){
    try{
        await request.jwtVerify();
    } catch(erro){
        reply.status(401).send({error: 'Token inválido ou ausente'});
    }
})

app.register(fastifyMultipart);

app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
});

app.register(router)

app.listen({port:3333}, (err, address) =>{
    if(err){
        console.log(err)
        process.exit(1)
    }

    console.log(`Servidor rodando em ${address}`)
})