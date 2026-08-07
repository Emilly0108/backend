import fastify from 'fastify';
import { router } from '../routes/router';

const app = fastify();

app.register(router)

app.listen({port:3333}, (err, address) =>{
    if(err){
        console.log(err)
        process.exit(1)
    }

    console.log(`Servidor rodando em ${address}`)
})