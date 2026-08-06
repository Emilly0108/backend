export function materiais(server){
    server.post('/materiais', async(request, reply) =>{
        return 'Hello - materiais'
    })

    server.get('/materiais', async(request, reply) =>{
        return 'listar - materiais'
    })

    server.put('/materiais:id', async(request, reply) =>{
        return 'atualizar - materiais'
    })

    server.delete('/materiais:id', async(request, reply)=>{
        return 'deletar - materiais'
    })
}