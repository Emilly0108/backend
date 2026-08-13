import { prisma } from "../lib/prisma.ts"
export function materiais(server){
    //cadastrar
    server.post('/materiais', async(request, reply) =>{
        const data = await request.file();

        if(!data){
            return reply.status(400).send({error: 'Nenhum arquivo enviado'});

        }

        const titulo = data.fields.titulo?.value;
        const descricao = data.fields.descricao?.value;
        const disciplinaId = data.fields.disciplinaId?.value;

        if(!titulo || !descricao || !disciplinaId){
            return reply.status(400).send({error: 'Campos obrigatórios faltando'}); 
        }

        const professorId = data.fields.professorId?.value;

        const nomeArquivo = `${Date.now()}-${data.filename}`;
        const caminhoDestino = `uploads/${nomeArquivo}`;

        const fs = await import('fs');
        const {pipeline} = await import ('stream/promises');

        fs.mkdirSync('uploads', {recursive: true});
        await pipeline(data.file, fs.createWriteStream(caminhoDestino));

        const material = await prisma.material.create({
            data:{
                titulo,
                descricao,
                url: caminhoDestino,
                status: 'pendente',
                professorId: Number(professorId),
                disciplinaId: Number(disciplinaId),
            },
        });

        return reply.status(201).send(material);
    })
    //exibe materiais
    server.get('/materiais', async(request, reply) =>{
        const materiais = await prisma.material.findMany({
            where:{
                status: 'aprovado'
            },
            include: {
                disciplina: true,
                professor: true
            }
        });
        
        return reply.status(200).send(materiais);
    })
    //usada em materiais em avaliação
    server.get('/materiais/pendentes', async(request,reply) => {
        const materiais = await prisma.material.findMany({
            where:{
                status: 'pendente'
            },
            include:{
                disciplina: true
            },
            orderBy:{
                createdAt: 'desc'
            }
        });

        return reply.status(200).send(materiais);
    })

    server.get('/materiais/:id', async(request, reply) =>{
        const {id} = request.params;

        const material = await prisma.material.findUnique({
            where: {id:Number(id)}
        })

        if(!material){
            return reply.status(404).send({mensagem: 'Material não encontrado'})
        }

        return reply.status(200).send(material);
    } )

    server.put('/materiais/:id', async(request, reply) =>{
        const {id} = request.params;

        const {titulo, descricao, disciplinaId} = request.body;

        const material = await prisma.material.update({
            where:{
                id:Number(id)
            },
            data: {
                titulo,
                descricao,
                disciplinaId: Number(disciplinaId)
            }
        });

        return reply.status(200).send(material);
    })

    server.put('/materiais/:id/aprovar', async(request, reply)=>{
        const { id } = request.params;

        const material = await prisma.material.update({
            where:{
                id: Number(id)
            },
            data: {
                status: 'aprovado',
                motivoRejeicao: null
            }
        });

        return reply.status(200).send(material);
    })

    server.put('/materiais/:id/rejeitar', async(request, reply)=>{
        const { id }  = request.params;

        const { motivoRejeicao } = request.body;

        const material = await prisma.material.update({
            where: {
                id: Number(id)
            },
            data:{
                status: 'rejeitado',
                motivoRejeicao: motivoRejeicao || null
            }
        });

        return reply.status(200).send(material);    
    })

    server.delete('/materiais/:id', async(request, reply)=>{
        const {id} = request.params

        await prisma.material.delete({
            where: {id: Number(id)}
        })

        return reply.status(204).send()
    })
}