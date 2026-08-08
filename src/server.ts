import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { router } from '../routes/router';

const app = fastify();

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