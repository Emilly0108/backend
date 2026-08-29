import { prisma } from "../lib/prisma.ts"

export function favoritos(server) {

  // GET /favoritos -> Busca apenas os favoritos do usuário logado
  server.get('/favoritos', { onRequest: [server.authenticate] }, async (request, reply) => {
    const search = request.query?.search
    const usuarioId = request.user?.professor?.id || request.user?.id || request.user?.sub || request.user?.usuarioId || request.user

    const favoritos = await prisma.favorito.findMany({
      where: {
        idUsuario: Number(usuarioId),
        ...(search ? {
          material: {
            titulo: { contains: String(search), mode: 'insensitive' }
          }
        } : {})
      },
      include: {
        material: {
          include: {
            disciplina: true
          }
        } 
      }
    })

    return reply.send(favoritos)
  })

  // POST /favoritos -> Salva o favorito atrelado ao usuário logado
  server.post('/favoritos', { onRequest: [server.authenticate] }, async (request, reply) => {
    try {
      const id_material = request.body?.id_material || request.body?.materialId || request.body?.idMaterial;
      const numMaterialId = Number(id_material);

      const rawUser = request.user;
      const rawId = rawUser?.professor?.id || rawUser?.id || rawUser?.sub || rawUser?.usuarioId || rawUser;
      const numUsuarioId = Number(rawId);

      if (!numMaterialId || isNaN(numMaterialId)) {
        return reply.status(400).send({ message: "ID do material é inválido ou ausente." });
      }

      if (!numUsuarioId || isNaN(numUsuarioId)) {
        return reply.status(401).send({ message: "Usuário/Professor não identificado no token." });
      }

      // 1. Evita duplicar o mesmo favorito
      const jaExiste = await prisma.favorito.findFirst({
        where: {
          idUsuario: numUsuarioId,
          idMaterial: numMaterialId
        }
      });

      if (jaExiste) {
        return reply.status(200).send(jaExiste);
      }

      // 2. Cria utilizando a conexão direta das relações do Prisma
      const favorito = await prisma.favorito.create({
        data: {
          material: { connect: { id: numMaterialId } },
          usuario: { connect: { id: numUsuarioId } }
        }
      });

      return reply.status(201).send(favorito);

    } catch (error) {
      console.error("Erro interno ao favoritar:", error);
      return reply.status(500).send({ 
        message: "Erro ao favoritar no banco de dados", 
        detalhes: error.message 
      });
    }
  });

  // GET /favoritos/:id
  server.get('/favoritos/:id', { onRequest: [server.authenticate] }, async (request, reply) => {
    const { id } = request.params
    const usuarioId = request.user?.professor?.id || request.user?.id || request.user?.sub || request.user?.usuarioId || request.user

    const favorito = await prisma.favorito.findUnique({
      where: {
        id: Number(id)
      }
    })

    if (!favorito || favorito.idUsuario !== Number(usuarioId)) {
      return reply.status(404).send({ message: "Material favorito não encontrado" })
    }

    return reply.send(favorito)
  })

  // DELETE /favoritos/:id -> Remove o favorito filtrando por ID do favorito e do Usuário
  server.delete('/favoritos/:id', { onRequest: [server.authenticate] }, async (request, reply) => {
    const { id } = request.params
    const usuarioId = request.user?.professor?.id || request.user?.id || request.user?.sub || request.user?.usuarioId || request.user

    await prisma.favorito.deleteMany({
      where: { 
        idUsuario: Number(usuarioId),
        OR: [
          { id: Number(id) },
          { idMaterial: Number(id) }
        ]
      }
    })

    return reply.status(204).send()
  })

}