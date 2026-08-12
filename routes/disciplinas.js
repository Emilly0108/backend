import { prisma } from "../lib/prisma.ts"
export function disciplinas(server){
    server.post('/disciplinas', async(request, reply) => {
        const {nome} = request.body

        const nomeFormatado = nome.trim(); // limpa o texto

        const disciplinaExistente = await prisma.disciplina.findFirst({
            where: {
                nome: {
                    equals: nomeFormatado, // equals é como se fosse "igual a"
                    mode: 'insensitive' // aceita letras minusculas e maiusculas
                }
            }
        });

        if (disciplinaExistente) { // verifica se a disciplina existe
            return reply.status(400).send({ 
                mensagem: 'Já existe uma disciplina cadastrada com esse nome.' 
            });
        }


        const disciplina = await prisma.disciplina.create({
            data: { nome: nomeFormatado }
        })

        return disciplina
    })

    server.get('/disciplinas', async (request, reply) => {
        const search = request.query.search

        const disciplinas = await prisma.disciplina.findMany({
            where: search ? {
                nome: { contains: search, mode: 'insensitive' }
            } : undefined,
            include: {
                materiais: {
                    select: { professorId: true }
                },
                _count: {
                    select: { materiais: true }
                }
            }
        })

        const resultado = disciplinas.map(d => {
            const professoresUnicos = new Set(d.materiais.map(m => m.professorId))

            return {
                id: d.id,
                nome: d.nome,
                materiais: d._count.materiais,
                questoes: 0,
                acessos: 0,
                professores: professoresUnicos.size
            }
        })

        return resultado
    })

    server.get('/disciplinas/:id', async (request, reply) => {
        const {id} = request.params;

        const disciplina = await prisma.disciplina.findUnique({
            where: {id: Number(id)},
            include: {
                materiais: {
                    select: { professorId: true }
                },
                _count: {
                    select: { materiais: true }
                }
            }
        })

        if(!disciplina){
            return reply.status(404).send({mensagem: 'Disciplina não encontrada'})
        }

        const professoresUnicos = new Set(disciplina.materiais.map(m => m.professorId))

        return reply.status(200).send({
            id: disciplina.id,
            nome: disciplina.nome,
            materiais: disciplina._count.materiais,
            questoes: 0,
            acessos: 0,
            professores: professoresUnicos.size
        });
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

        try{
            await prisma.disciplina.delete({
                where: {id: Number(id)}
            })
            return reply.status(204).send()
        } catch (error){
            return reply.status(404).send({mensagem: 'Disciplina não encontrada'})
        }
    })
}