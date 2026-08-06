export function disciplinasRoutes(server){
    server.post('/disciplinas', async(request, reply) => {
        return 'Hello - Disciplinas'
    })

    server.get('/disciplinas', async (request,reply)=>{
        return 'listar - Disciplinas'
    })

    server.put('/disciplinas:id', async(request, reply)=>{
        return 'atualizar - Disciplinas'
    })

    server.delete('/disciplinas:id', async(request, reply) =>{
        return 'deletar - Disciplinas'
    })
}