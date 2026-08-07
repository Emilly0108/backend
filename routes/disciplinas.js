import { prisma } from "../lib/prisma.ts"
export function disciplinas(server){
    server.post('/disciplinas', async(request, reply) => {
        const {nome} = request.body

        const disciplina = await prisma.disciplina.create({
            data:{
                nome
            }

        })

        return disciplina
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