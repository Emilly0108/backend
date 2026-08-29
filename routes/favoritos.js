import { prisma } from "../lib/prisma.ts"

export function favoritos(server) {

  // GET /favoritos -> Busca apenas os favoritos do usuário logado
  server.get('/favoritos', { onRequest: [server.authenticate] }, async (request, reply) => {
    try {
      const search = request.query?.search
      const rawUser = request.user
      const usuarioId = Number(rawUser?.professor?.id || rawUser?.id || rawUser?.sub || rawUser?.usuarioId)

      if (!usuarioId || isNaN(usuarioId)) {
        return reply.status(200).send([])
      }

      const favoritos = await prisma.favorito.findMany({
        where: {
          idUsuario: usuarioId,
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
    } catch (error) {
      console.error("Erro no GET /favoritos:", error)
      return reply.status(500).send({ message: "Erro ao buscar favoritos", error: error.message })
    }
  })

  // POST /favoritos -> Salva o favorito atrelado ao usuário logado
  server.post('/favoritos', { onRequest: [server.authenticate] }, async (request, reply) => {
    try {
      const id_material = request.body?.id_material || request.body?.materialId || request.body?.idMaterial;
      const numMaterialId = Number(id_material);

      const rawUser = request.user;
      const rawId = rawUser?.professor?.id || rawUser?.id || rawUser?.sub || rawUser?.usuarioId;
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

      // 2. Cria inserindo os IDs diretos nos campos escalares para evitar falha no Prisma
      const favorito = await prisma.favorito.create({
        data: {
          idMaterial: numMaterialId,
          idUsuario: numUsuarioId
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
    try {
      const { id } = request.params
      const rawUser = request.user
      const usuarioId = Number(rawUser?.professor?.id || rawUser?.id || rawUser?.sub || rawUser?.usuarioId)

      const favorito = await prisma.favorito.findUnique({
        where: {
          id: Number(id)
        }
      })

      if (!favorito || favorito.idUsuario !== usuarioId) {
        return reply.status(404).send({ message: "Material favorito não encontrado" })
      }

      return reply.send(favorito)
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao buscar favorito por ID", error: error.message })
    }
  })

  // DELETE /favoritos/:id -> Remove o favorito filtrando por ID do favorito/material e do Usuário
  server.delete('/favoritos/:id', { onRequest: [server.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params
      const rawUser = request.user
      const usuarioId = Number(rawUser?.professor?.id || rawUser?.id || rawUser?.sub || rawUser?.usuarioId)

      if (!usuarioId || isNaN(usuarioId)) {
        return reply.status(401).send({ message: "Usuário/Professor não identificado no token." })
      }

      await prisma.favorito.deleteMany({
        where: { 
          idUsuario: usuarioId,
          OR: [
            { id: Number(id) },
            { idMaterial: Number(id) }
          ]
        }
      })

      return reply.status(204).send()
    } catch (error) {
      console.error("Erro no DELETE /favoritos:", error)
      return reply.status(500).send({ message: "Erro ao remover favorito", error: error.message })
    }
  })

}