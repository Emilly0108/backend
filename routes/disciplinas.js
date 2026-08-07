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

        const search = request.query.search

        const disciplinas = await prisma.disciplina.findMany({
            where:search?{
                nome: {contains: search, mode: 'insensitive'}
            } : undefined
        })
        return disciplinas
    })

    server.put('/disciplinas/:id', async(request, reply)=>{
        const {id} = request.params
        const {nome} = request.body

        const disciplina = await prisma.disciplina.update({
            where: {id: Number(id)},
            data: {nome}
        })

        return disciplina
    })

    server.delete('/disciplinas/:id', async(request, reply) =>{
        const {id} = request.params

        await prisma.disciplina.delete({
            where: {id: Number(id)}
        })

        return reply.status(204).send()
    })
}