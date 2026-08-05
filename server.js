import {fastify} from 'fastify'
import { router } from './routes/router.js';
const server = fastify()

await server.register(router);

server.listen({
    port:3333,
})
