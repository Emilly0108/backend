import {fastify} from 'fastify'

const server = fastify()

server.get('/professores', ()=>{
    return 'hello word - professores'
})

server.get('/disciplinas', () =>{
    return 'hello word - disciplinas'
})

server.get('/materiais', () =>{
    return 'hello word - materiais'
})

server.get('/favoritos', () =>{
    return 'hello word - favoritos'
})

server.listen({
    port:3333,
})
