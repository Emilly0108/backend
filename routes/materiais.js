
import { prisma } from "../lib/prisma.ts"
export function materiais(server){
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